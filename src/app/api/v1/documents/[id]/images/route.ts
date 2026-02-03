import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, RATE_LIMITS } from '@/lib/api-auth';
import { query } from '@/lib/database';

interface ImageRow {
  id: string;
  document_id: string;
  page_number: number | null;
  file_path_r2: string | null;
  width: number | null;
  height: number | null;
  has_faces: boolean;
}

interface FaceRow {
  id: string;
  image_id: string;
  bbox_x: number | null;
  bbox_y: number | null;
  bbox_width: number | null;
  bbox_height: number | null;
  cluster_id: string | null;
  cluster_label: string | null;
  confidence: number | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Validate API key
  const auth = await validateApiKey(request);

  if (!auth.valid || !auth.data) {
    return NextResponse.json(
      {
        error: {
          code: 'UNAUTHORIZED',
          message: auth.error || 'Invalid or missing API key',
        },
      },
      { status: 401 }
    );
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const hasFaces = searchParams.get('has_faces');

  try {
    // Build WHERE clause
    let whereClause = 'WHERE document_id = $1';
    const params_arr: string[] = [id];

    if (hasFaces === 'true') {
      whereClause += ' AND has_faces = true';
    }

    // Get images for document
    const imagesResult = await query<ImageRow>(
      `SELECT id, document_id, page_number, file_path_r2, width, height, has_faces
       FROM extracted_images
       ${whereClause}
       ORDER BY page_number`,
      params_arr
    );

    if (imagesResult.length === 0) {
      // Check if document exists
      const docCheck = await query<{ id: string }>(
        'SELECT id FROM documents WHERE id = $1',
        [id]
      );

      if (docCheck.length === 0) {
        return NextResponse.json(
          {
            error: {
              code: 'NOT_FOUND',
              message: `Document '${id}' not found`,
            },
          },
          { status: 404 }
        );
      }
    }

    // Get faces for these images
    const imageIds = imagesResult.map(img => img.id);
    const facesMap: Record<string, FaceRow[]> = {};

    if (imageIds.length > 0) {
      const facesResult = await query<FaceRow>(
        `SELECT f.id, f.image_id, f.bbox_x, f.bbox_y, f.bbox_width, f.bbox_height,
                f.cluster_id, fc.label as cluster_label, f.confidence
         FROM faces f
         LEFT JOIN face_clusters fc ON f.cluster_id = fc.id
         WHERE f.image_id = ANY($1::text[])`,
        [imageIds]
      );

      for (const face of facesResult) {
        if (!facesMap[face.image_id]) {
          facesMap[face.image_id] = [];
        }
        facesMap[face.image_id].push(face);
      }
    }

    const images = imagesResult.map(img => ({
      id: img.id,
      document_id: img.document_id,
      page_number: img.page_number,
      image_url: img.file_path_r2,
      width: img.width,
      height: img.height,
      has_faces: img.has_faces,
      faces: (facesMap[img.id] || []).map(f => ({
        id: f.id,
        bounding_box: f.bbox_x !== null ? {
          x: f.bbox_x,
          y: f.bbox_y,
          width: f.bbox_width,
          height: f.bbox_height,
        } : null,
        cluster_id: f.cluster_id,
        cluster_label: f.cluster_label,
        confidence: f.confidence,
      })),
    }));

    const limits = RATE_LIMITS[auth.data.tier];

    return NextResponse.json(
      {
        data: images,
        meta: {
          document_id: id,
          total: images.length,
        },
      },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'X-RateLimit-Limit': String(limits.daily),
          'X-RateLimit-Remaining': String(Math.max(0, limits.daily - auth.data.dailyUsage)),
          'X-API-Tier': auth.data.tier,
        },
      }
    );
  } catch (error) {
    console.error('API images error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch images',
        },
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
    },
  });
}
