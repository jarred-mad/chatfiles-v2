import { NextRequest, NextResponse } from 'next/server';
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
  const { searchParams } = new URL(request.url);

  const searchQuery = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
  const type = searchParams.get('type');
  const datasets = searchParams.get('datasets')?.split(',').map(Number).filter(n => !isNaN(n));
  const sort = searchParams.get('sort') || 'relevance';

  const startTime = Date.now();
  const offset = (page - 1) * limit;

  try {
    // Build the WHERE clause
    const conditions: string[] = [];
    const params: (string | number | number[])[] = [];
    let paramIndex = 1;

    // Search query - search in filename and text_content
    if (searchQuery) {
      conditions.push(`(
        filename ILIKE $${paramIndex} OR
        text_content ILIKE $${paramIndex} OR
        id IN (SELECT document_id FROM mentioned_names WHERE name ILIKE $${paramIndex})
      )`);
      params.push(`%${searchQuery}%`);
      paramIndex++;
    }

    // Filter by document type
    if (type) {
      conditions.push(`document_type = $${paramIndex}`);
      params.push(type);
      paramIndex++;
    }

    // Filter by datasets
    if (datasets && datasets.length > 0) {
      conditions.push(`dataset_number = ANY($${paramIndex}::int[])`);
      params.push(datasets);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Determine sort order
    let orderClause = 'ORDER BY ';
    switch (sort) {
      case 'dataset':
        orderClause += 'dataset_number ASC, filename ASC';
        break;
      case 'filename':
        orderClause += 'filename ASC';
        break;
      case 'confidence':
        orderClause += 'ocr_confidence DESC NULLS LAST';
        break;
      default: // relevance - prioritize matches in filename, then by dataset
        if (searchQuery) {
          orderClause += `
            CASE WHEN filename ILIKE $${paramIndex} THEN 0 ELSE 1 END,
            dataset_number ASC,
            filename ASC
          `;
          params.push(`%${searchQuery}%`);
          paramIndex++;
        } else {
          orderClause += 'dataset_number ASC, filename ASC';
        }
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM documents ${whereClause}`;
    const countParams = params.slice(0, conditions.length); // Only use filter params for count
    const countResult = await query<{ total: string }>(countQuery, countParams);
    const total = parseInt(countResult[0]?.total || '0', 10);

    // Get paginated results
    const searchSql = `
      SELECT id, filename, dataset_number, document_type,
             SUBSTRING(text_content, 1, 500) as text_content,
             ocr_confidence, page_count
      FROM documents
      ${whereClause}
      ${orderClause}
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

    // Format results with highlighting
    const formattedResults = results.map((doc) => {
      let highlightedText = doc.text_content || '';

      // Add highlighting for search query
      if (searchQuery && highlightedText) {
        const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
      }

      return {
        id: doc.id,
        filename: doc.filename,
        dataset_number: doc.dataset_number,
        document_type: doc.document_type || 'document',
        text_content: doc.text_content || '',
        ocr_confidence: doc.ocr_confidence || 0,
        page_count: doc.page_count || 1,
        mentioned_names: namesMap[doc.id] || [],
        _formatted: {
          text_content: highlightedText,
        },
      };
    });

    return NextResponse.json({
      results: formattedResults,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      processingTimeMs: Date.now() - startTime,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
