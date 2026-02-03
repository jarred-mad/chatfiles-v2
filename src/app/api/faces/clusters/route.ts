import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

interface ClusterRow {
  id: string;
  label: string | null;
  sample_image_path: string | null;
  face_count: number;
  is_known_person: boolean;
  documents_count: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
  const knownOnly = searchParams.get('known_only') === 'true';

  const offset = (page - 1) * limit;

  try {
    const whereClause = knownOnly ? 'WHERE fc.is_known_person = true' : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM face_clusters fc ${whereClause}`;
    const countResult = await query<{ total: string }>(countQuery);
    const total = parseInt(countResult[0]?.total || '0', 10);

    // Get clusters with document count
    const clustersQuery = `
      SELECT
        fc.id,
        fc.label,
        fc.sample_image_path,
        fc.face_count,
        fc.is_known_person,
        COUNT(DISTINCT f.document_id) as documents_count
      FROM face_clusters fc
      LEFT JOIN faces f ON fc.id = f.cluster_id
      ${whereClause}
      GROUP BY fc.id, fc.label, fc.sample_image_path, fc.face_count, fc.is_known_person
      ORDER BY fc.is_known_person DESC, fc.face_count DESC
      LIMIT $1 OFFSET $2
    `;
    const clusters = await query<ClusterRow>(clustersQuery, [limit, offset]);

    // Get summary stats
    const summaryQuery = `
      SELECT
        COUNT(*) as total_clusters,
        SUM(CASE WHEN is_known_person THEN 1 ELSE 0 END) as known_persons,
        SUM(CASE WHEN NOT is_known_person THEN 1 ELSE 0 END) as unknown_persons,
        SUM(face_count) as total_faces
      FROM face_clusters
    `;
    const summaryResult = await query<{
      total_clusters: string;
      known_persons: string;
      unknown_persons: string;
      total_faces: string;
    }>(summaryQuery);

    return NextResponse.json({
      clusters: clusters.map(c => ({
        id: c.id,
        label: c.label,
        sample_image_path: c.sample_image_path,
        face_count: c.face_count,
        is_known_person: c.is_known_person,
        documents_count: parseInt(c.documents_count, 10),
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
      summary: {
        total_clusters: parseInt(summaryResult[0]?.total_clusters || '0', 10),
        known_persons: parseInt(summaryResult[0]?.known_persons || '0', 10),
        unknown_persons: parseInt(summaryResult[0]?.unknown_persons || '0', 10),
        total_faces: parseInt(summaryResult[0]?.total_faces || '0', 10),
      },
    });
  } catch (error) {
    console.error('Clusters API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clusters', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
