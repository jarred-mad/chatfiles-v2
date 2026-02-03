import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, RATE_LIMITS } from '@/lib/api-auth';
import { query } from '@/lib/database';

interface ClusterRow {
  id: string;
  label: string | null;
  face_count: number;
}

interface FaceRow {
  id: string;
  document_id: string | null;
  document_filename: string | null;
  page_number: number | null;
  confidence: number | null;
}

interface CoOccurringRow {
  id: string;
  label: string | null;
  co_occurrences: string;
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
  const includeFaces = searchParams.get('include_faces') !== 'false';
  const faceLimit = Math.min(parseInt(searchParams.get('face_limit') || '50', 10), 200);

  try {
    // Get cluster
    const clusterResult = await query<ClusterRow>(
      `SELECT id, label, face_count
       FROM face_clusters
       WHERE id = $1`,
      [id]
    );

    if (clusterResult.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: `Face cluster with id '${id}' not found`,
          },
        },
        { status: 404 }
      );
    }

    const cluster = clusterResult[0];

    // Get document count
    const docCountResult = await query<{ count: string }>(
      `SELECT COUNT(DISTINCT document_id) as count FROM faces WHERE cluster_id = $1`,
      [id]
    );

    let faces: FaceRow[] = [];
    if (includeFaces) {
      faces = await query<FaceRow>(
        `SELECT f.id, f.document_id, d.filename as document_filename,
                ei.page_number, f.confidence
         FROM faces f
         LEFT JOIN documents d ON f.document_id = d.id
         LEFT JOIN extracted_images ei ON f.image_id = ei.id
         WHERE f.cluster_id = $1
         ORDER BY f.confidence DESC
         LIMIT $2`,
        [id, faceLimit]
      );
    }

    // Get co-occurring clusters (faces in same documents)
    const coOccurring = await query<CoOccurringRow>(
      `SELECT fc.id, fc.label, COUNT(*) as co_occurrences
       FROM faces f1
       JOIN faces f2 ON f1.document_id = f2.document_id AND f1.cluster_id != f2.cluster_id
       JOIN face_clusters fc ON f2.cluster_id = fc.id
       WHERE f1.cluster_id = $1
       GROUP BY fc.id, fc.label
       ORDER BY co_occurrences DESC
       LIMIT 10`,
      [id]
    );

    const response = {
      id: cluster.id,
      label: cluster.label,
      face_count: cluster.face_count,
      document_count: parseInt(docCountResult[0]?.count || '0', 10),
      is_known_person: cluster.label !== null && cluster.label !== '',
      faces: includeFaces ? faces.map(f => ({
        id: f.id,
        document_id: f.document_id,
        document_filename: f.document_filename,
        page_number: f.page_number,
        confidence: f.confidence,
      })) : undefined,
      co_occurring_clusters: coOccurring.map(c => ({
        id: c.id,
        label: c.label,
        co_occurrences: parseInt(c.co_occurrences, 10),
      })),
    };

    const limits = RATE_LIMITS[auth.data.tier];

    return NextResponse.json(
      {
        data: response,
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
    console.error('API cluster detail error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch cluster',
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
