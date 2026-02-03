import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

interface ImageRow {
  id: string;
  document_id: string;
  document_filename: string;
  page_number: number | null;
  image_path_r2: string | null;
  width: number | null;
  height: number | null;
  has_faces: boolean;
  dataset_number: number;
  face_count: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = Math.min(parseInt(searchParams.get('limit') || '24', 10), 100);
  const dataset = searchParams.get('dataset');
  const hasFaces = searchParams.get('has_faces');
  const documentId = searchParams.get('document');

  const offset = (page - 1) * limit;

  try {
    // Build WHERE clause
    const conditions: string[] = [];
    const params: (string | number)[] = [];
    let paramIndex = 1;

    if (dataset) {
      conditions.push(`d.dataset_number = $${paramIndex}`);
      params.push(parseInt(dataset, 10));
      paramIndex++;
    }

    if (hasFaces === 'true') {
      conditions.push(`ei.has_faces = true`);
    }

    if (documentId) {
      conditions.push(`ei.document_id = $${paramIndex}`);
      params.push(documentId);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM extracted_images ei
      JOIN documents d ON ei.document_id = d.id
      ${whereClause}
    `;
    const countResult = await query<{ total: string }>(countQuery, params);
    const total = parseInt(countResult[0]?.total || '0', 10);

    // Get images with document info
    const imagesQuery = `
      SELECT
        ei.id,
        ei.document_id,
        d.filename as document_filename,
        ei.page_number,
        ei.image_path_r2,
        ei.width,
        ei.height,
        ei.has_faces,
        d.dataset_number,
        (SELECT COUNT(*) FROM faces f WHERE f.image_id = ei.id) as face_count
      FROM extracted_images ei
      JOIN documents d ON ei.document_id = d.id
      ${whereClause}
      ORDER BY ei.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const images = await query<ImageRow>(imagesQuery, [...params, limit, offset]);

    // Get dataset counts for filter
    const datasetsQuery = `
      SELECT d.dataset_number, COUNT(*) as count
      FROM extracted_images ei
      JOIN documents d ON ei.document_id = d.id
      GROUP BY d.dataset_number
      ORDER BY d.dataset_number
    `;
    const datasets = await query<{ dataset_number: number; count: string }>(datasetsQuery);

    return NextResponse.json({
      results: images.map(img => ({
        id: img.id,
        document_id: img.document_id,
        document_name: img.document_filename,
        page_number: img.page_number || 1,
        image_path: img.image_path_r2,
        width: img.width || 300,
        height: img.height || 200,
        has_faces: img.has_faces,
        dataset_number: img.dataset_number,
        face_count: parseInt(img.face_count, 10),
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
    console.error('Photos API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photos', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
