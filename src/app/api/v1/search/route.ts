import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, RATE_LIMITS } from '@/lib/api-auth';
import { query } from '@/lib/database';

interface DocumentRow {
  id: string;
  filename: string;
  dataset_number: number;
  document_type: string;
  text_content: string | null;
  ocr_confidence: number | null;
  page_count: number | null;
}

interface NameRow {
  document_id: string;
  names: string[];
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

  const searchQuery = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
  const dataset = searchParams.get('dataset');
  const type = searchParams.get('type');

  // Free tier limited to 100 results total
  if (auth.data.tier === 'free' && page * limit > 100) {
    return NextResponse.json(
      {
        error: {
          code: 'LIMIT_EXCEEDED',
          message: 'Free tier is limited to 100 results. Upgrade to Pro for more.',
        },
      },
      { status: 403 }
    );
  }

  const offset = (page - 1) * limit;

  try {
    // Build WHERE clause
    const conditions: string[] = [];
    const params: (string | number | number[])[] = [];
    let paramIndex = 1;

    if (searchQuery) {
      conditions.push(`(
        filename ILIKE $${paramIndex} OR
        text_content ILIKE $${paramIndex} OR
        id IN (SELECT document_id FROM mentioned_names WHERE name ILIKE $${paramIndex})
      )`);
      params.push(`%${searchQuery}%`);
      paramIndex++;
    }

    if (type) {
      conditions.push(`document_type = $${paramIndex}`);
      params.push(type);
      paramIndex++;
    }

    if (dataset) {
      conditions.push(`dataset_number = $${paramIndex}`);
      params.push(parseInt(dataset, 10));
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM documents ${whereClause}`;
    const countParams = params.slice(0, conditions.length);
    const countResult = await query<{ total: string }>(countQuery, countParams);
    const total = parseInt(countResult[0]?.total || '0', 10);

    // Get paginated results
    const searchSql = `
      SELECT id, filename, dataset_number, document_type,
             SUBSTRING(text_content, 1, 300) as text_content,
             ocr_confidence, page_count
      FROM documents
      ${whereClause}
      ORDER BY dataset_number ASC, filename ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    const results = await query<DocumentRow>(searchSql, params);

    // Get mentioned names for results
    const docIds = results.map(r => r.id);
    let namesMap: Record<string, string[]> = {};

    if (docIds.length > 0) {
      const namesQuery = `
        SELECT document_id, ARRAY_AGG(DISTINCT name ORDER BY name) as names
        FROM mentioned_names
        WHERE document_id = ANY($1::text[])
        GROUP BY document_id
      `;
      const namesResult = await query<NameRow>(namesQuery, [docIds]);
      namesMap = Object.fromEntries(namesResult.map(r => [r.document_id, r.names || []]));
    }

    const formattedResults = results.map(doc => ({
      id: doc.id,
      filename: doc.filename,
      dataset_number: doc.dataset_number,
      document_type: doc.document_type || 'document',
      excerpt: doc.text_content || '',
      ocr_confidence: doc.ocr_confidence || 0,
      page_count: doc.page_count || 1,
      mentioned_names: namesMap[doc.id] || [],
      url: `https://chatfiles.org/documents/${doc.id}`,
    }));

    const limits = RATE_LIMITS[auth.data.tier];

    return NextResponse.json(
      {
        data: formattedResults,
        meta: {
          query: searchQuery,
          total,
          page,
          limit,
          total_pages: Math.ceil(total / limit),
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
    console.error('API search error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Search failed',
        },
      },
      { status: 500 }
    );
  }
}

// CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
    },
  });
}
