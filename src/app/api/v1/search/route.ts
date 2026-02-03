import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, RATE_LIMITS } from '@/lib/api-auth';

// Mock search results
const mockResults = [
  {
    id: 'doc_001',
    filename: 'FBI_302_Interview_Report_2019.pdf',
    dataset_number: 10,
    document_type: 'fbi_report',
    excerpt: 'This document contains an FBI 302 interview report...',
    ocr_confidence: 0.92,
    page_count: 15,
    mentioned_names: ['Jeffrey Epstein', 'Ghislaine Maxwell'],
    url: 'https://chatfiles.org/documents/doc_001',
  },
  {
    id: 'doc_002',
    filename: 'Deposition_Transcript_Vol1.pdf',
    dataset_number: 12,
    document_type: 'transcript',
    excerpt: 'Deposition transcript of witness testimony...',
    ocr_confidence: 0.88,
    page_count: 45,
    mentioned_names: ['Prince Andrew', 'Virginia Giuffre'],
    url: 'https://chatfiles.org/documents/doc_002',
  },
];

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

  const query = searchParams.get('q') || '';
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

  // Filter mock results
  let results = [...mockResults];

  if (query) {
    const lowerQuery = query.toLowerCase();
    results = results.filter(
      (doc) =>
        doc.filename.toLowerCase().includes(lowerQuery) ||
        doc.excerpt.toLowerCase().includes(lowerQuery) ||
        doc.mentioned_names.some((name) => name.toLowerCase().includes(lowerQuery))
    );
  }

  if (dataset) {
    results = results.filter((doc) => doc.dataset_number === parseInt(dataset, 10));
  }

  if (type) {
    results = results.filter((doc) => doc.document_type === type);
  }

  const total = results.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const paginatedResults = results.slice(startIndex, startIndex + limit);

  const limits = RATE_LIMITS[auth.data.tier];

  return NextResponse.json(
    {
      data: paginatedResults,
      meta: {
        query,
        total,
        page,
        limit,
        total_pages: totalPages,
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
