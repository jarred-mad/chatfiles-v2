import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, RATE_LIMITS } from '@/lib/api-auth';
import { query } from '@/lib/database';

interface ClusterRow {
  id: string;
  label: string | null;
  face_count: number;
  document_count: string;
}

export async function GET(request: NextRequest) {
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

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
  const knownOnly = searchParams.get('known_only') === 'true';

  const offset = (page - 1) * limit;

  try {
    const whereClause = knownOnly ? "WHERE fc.label IS NOT NULL AND fc.label != ''" : '';

    // Get total count
    const countResult = await query<{ total: string }>(
      `SELECT COUNT(*) as total FROM face_clusters fc ${whereClause}`
    );
    const total = parseInt(countResult[0]?.total || '0', 10);

    // Get clusters with document count
    const clustersResult = await query<ClusterRow>(
      `SELECT
        fc.id,
        fc.label,
        fc.face_count,
        COUNT(DISTINCT f.document_id) as document_count
      FROM face_clusters fc
      LEFT JOIN faces f ON fc.id = f.cluster_id
      ${whereClause}
      GROUP BY fc.id, fc.label, fc.face_count
      ORDER BY (fc.label IS NOT NULL AND fc.label != '') DESC, fc.face_count DESC
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    // Get summary stats
    const summaryResult = await query<{
      known_persons: string;
      unknown_persons: string;
    }>(
      `SELECT
        SUM(CASE WHEN label IS NOT NULL AND label != '' THEN 1 ELSE 0 END) as known_persons,
        SUM(CASE WHEN label IS NULL OR label = '' THEN 1 ELSE 0 END) as unknown_persons
      FROM face_clusters`
    );

    const clusters = clustersResult.map(c => ({
      id: c.id,
      label: c.label,
      face_count: c.face_count,
      document_count: parseInt(c.document_count, 10),
      is_known_person: c.label !== null && c.label !== '',
    }));

    const limits = RATE_LIMITS[auth.data.tier];

    return NextResponse.json(
      {
        data: clusters,
        meta: {
          total,
          page,
          limit,
          total_pages: Math.ceil(total / limit),
          known_persons: parseInt(summaryResult[0]?.known_persons || '0', 10),
          unknown_persons: parseInt(summaryResult[0]?.unknown_persons || '0', 10),
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
    console.error('API clusters error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch clusters',
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
