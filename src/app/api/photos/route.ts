import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

// R2 public URL for serving images
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL?.trim() || 'https://pub-e8b8792b476a4216b2cbd491f9d61af0.r2.dev';

function getFullImageUrl(path: string | null): string | null {
  if (!path) return null;
  // If already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // Prepend R2 public URL
  return `${R2_PUBLIC_URL}/${path}`;
}

interface ImageRow {
  id: string;
  document_id: string;
  document_filename: string;
  page_number: number | null;
  file_path_r2: string | null;
  width: number | null;
  height: number | null;
  has_faces: boolean;
  dataset_number: number;
  face_count: string;
  scene_type: string | null;
}

// Map frontend filter IDs to database scene_type values
const SCENE_TYPE_MAP: Record<string, string[]> = {
  people: ['a photograph of people'],
  mansion: ['a mansion or estate', 'a house or residential building'],
  yacht: ['a yacht or boat'],
  airplane: ['an airplane interior'],
  island: ['a private island', 'a beach or coastal area'],
  party: ['a party or social gathering', 'a formal event or gala'],
  documents: ['a scanned document or letter', 'a handwritten note', 'a legal document', 'a fax or printed communication'],
  office: ['an office or workplace', 'a meeting or conference'],
  bedroom: ['a hotel room or bedroom'],
  pool: ['a pool or swimming area'],
  dining: ['a restaurant or dining area'],
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = Math.min(parseInt(searchParams.get('limit') || '24', 10), 100);
  const dataset = searchParams.get('dataset');
  const hasFaces = searchParams.get('has_faces');
  const documentId = searchParams.get('document');
  const scene = searchParams.get('scene'); // Scene type filter

  const offset = (page - 1) * limit;

  try {
    // Build WHERE clause
    const conditions: string[] = [];
    const params: (string | number)[] = [];
    let paramIndex = 1;

    // Only show images that have actual R2 paths (thumbnails generated)
    conditions.push(`ei.file_path_r2 IS NOT NULL`);

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

    // Scene type filter
    if (scene && scene !== 'all' && SCENE_TYPE_MAP[scene]) {
      const sceneTypes = SCENE_TYPE_MAP[scene];
      const placeholders = sceneTypes.map((_, i) => `$${paramIndex + i}`).join(', ');
      conditions.push(`(ei.scene_type IN (${placeholders}) OR ei.document_type_class IN (${placeholders}))`);
      params.push(...sceneTypes);
      paramIndex += sceneTypes.length;
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
    // Prioritize images that have valid R2 paths (not null)
    const imagesQuery = `
      SELECT
        ei.id,
        ei.document_id,
        d.filename as document_filename,
        ei.page_number,
        ei.file_path_r2,
        ei.width,
        ei.height,
        ei.has_faces,
        d.dataset_number,
        ei.scene_type,
        (SELECT COUNT(*) FROM faces f WHERE f.image_id = ei.id) as face_count
      FROM extracted_images ei
      JOIN documents d ON ei.document_id = d.id
      ${whereClause}
      ORDER BY (ei.file_path_r2 IS NOT NULL) DESC, ei.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const images = await query<ImageRow>(imagesQuery, [...params, limit, offset]);

    // Get dataset counts for filter (only count images with R2 paths)
    const datasetsQuery = `
      SELECT d.dataset_number, COUNT(*) as count
      FROM extracted_images ei
      JOIN documents d ON ei.document_id = d.id
      WHERE ei.file_path_r2 IS NOT NULL
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
        image_path: getFullImageUrl(img.file_path_r2),
        width: img.width || 300,
        height: img.height || 200,
        has_faces: img.has_faces,
        dataset_number: img.dataset_number,
        face_count: parseInt(img.face_count, 10),
        scene_type: img.scene_type,
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
