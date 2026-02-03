import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, RATE_LIMITS } from '@/lib/api-auth';
import { query } from '@/lib/database';

interface DocumentRow {
  id: string;
  filename: string;
  dataset_number: number;
  document_type: string;
  original_url: string | null;
  file_path_r2: string | null;
  ocr_confidence: number | null;
  page_count: number | null;
  file_size_bytes: number | null;
  created_at: string;
  indexed_at: string | null;
}

interface NameRow {
  name: string;
  frequency: number;
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

  try {
    // Fetch document from database
    const docResult = await query<DocumentRow>(
      `SELECT id, filename, dataset_number, document_type, original_url, file_path_r2,
              ocr_confidence, page_count, file_size_bytes, created_at, indexed_at
       FROM documents WHERE id = $1`,
      [id]
    );

    if (docResult.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_FOUND',
            message: `Document with id '${id}' not found`,
          },
        },
        { status: 404 }
      );
    }

    const doc = docResult[0];

    // Get mentioned names
    const namesResult = await query<NameRow>(
      `SELECT name, frequency FROM mentioned_names WHERE document_id = $1 ORDER BY frequency DESC`,
      [id]
    );

    // Get image and face counts
    const countsResult = await query<{ image_count: string; face_count: string }>(
      `SELECT
        (SELECT COUNT(*) FROM extracted_images WHERE document_id = $1) as image_count,
        (SELECT COUNT(*) FROM faces WHERE document_id = $1) as face_count`,
      [id]
    );

    const limits = RATE_LIMITS[auth.data.tier];

    return NextResponse.json(
      {
        data: {
          id: doc.id,
          filename: doc.filename,
          dataset_number: doc.dataset_number,
          document_type: doc.document_type || 'document',
          original_url: doc.original_url,
          file_url: doc.file_path_r2,
          ocr_confidence: doc.ocr_confidence,
          page_count: doc.page_count,
          file_size_bytes: doc.file_size_bytes,
          created_at: doc.created_at,
          indexed_at: doc.indexed_at,
          mentioned_names: namesResult.map(n => ({
            name: n.name,
            frequency: n.frequency,
          })),
          image_count: parseInt(countsResult[0]?.image_count || '0', 10),
          face_count: parseInt(countsResult[0]?.face_count || '0', 10),
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
    console.error('API document error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch document',
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
