import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

interface ClusterRow {
  id: string;
  label: string | null;
  sample_image_path: string | null;
  face_count: number;
  is_known_person: boolean;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
  const knownOnly = searchParams.get('known_only') === 'true';

  const offset = (page - 1) * limit;

  try {
    const whereClause = knownOnly ? 'WHERE is_known_person = true' : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM face_clusters ${whereClause}`;
    const countResult = await query<{ total: string }>(countQuery);
    const total = parseInt(countResult[0]?.total || '0', 10);

    // Get clusters
    const clustersQuery = `
      SELECT id, label, sample_image_path, face_count, is_known_person
      FROM face_clusters
      ${whereClause}
      ORDER BY is_known_person DESC, face_count DESC
      LIMIT $1 OFFSET $2
    `;
    const clusters = await query<ClusterRow>(clustersQuery, [limit, offset]);

    return NextResponse.json({
      clusters: clusters.map(c => ({
        id: c.id,
        label: c.label,
        sample_image_path: c.sample_image_path,
        face_count: c.face_count,
        is_known: c.is_known_person,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Clusters API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clusters', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
