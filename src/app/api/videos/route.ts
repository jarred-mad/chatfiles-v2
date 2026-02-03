import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

interface VideoRow {
  id: string;
  filename: string;
  file_path_r2: string | null;
  file_size_bytes: number | null;
  dataset_number: number;
  created_at: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = Math.min(parseInt(searchParams.get('limit') || '24', 10), 100);
  const dataset = searchParams.get('dataset');

  const offset = (page - 1) * limit;

  try {
    // Build WHERE clause - videos are documents with type 'video'
    const conditions: string[] = ["document_type = 'video'"];
    const params: (string | number)[] = [];
    let paramIndex = 1;

    if (dataset) {
      conditions.push(`dataset_number = $${paramIndex}`);
      params.push(parseInt(dataset, 10));
      paramIndex++;
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM documents ${whereClause}`;
    const countResult = await query<{ total: string }>(countQuery, params);
    const total = parseInt(countResult[0]?.total || '0', 10);

    // Get videos
    const videosQuery = `
      SELECT id, filename, file_path_r2, file_size_bytes, dataset_number, created_at
      FROM documents
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    const videos = await query<VideoRow>(videosQuery, [...params, limit, offset]);

    // Get dataset counts for filter
    const datasetsQuery = `
      SELECT dataset_number, COUNT(*) as count
      FROM documents
      WHERE document_type = 'video'
      GROUP BY dataset_number
      ORDER BY dataset_number
    `;
    const datasets = await query<{ dataset_number: number; count: string }>(datasetsQuery);

    return NextResponse.json({
      videos: videos.map(v => ({
        id: v.id,
        filename: v.filename,
        file_path: v.file_path_r2,
        file_size_bytes: v.file_size_bytes || 0,
        dataset_number: v.dataset_number,
        created_at: v.created_at,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
      datasets: datasets.map(d => ({
        number: d.dataset_number,
        count: parseInt(d.count, 10),
      })),
    });
  } catch (error) {
    console.error('Videos API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
