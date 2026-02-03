import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, RATE_LIMITS } from '@/lib/api-auth';

// Mock document data
const mockDocument = {
  id: 'doc_001',
  filename: 'FBI_302_Interview_Report_2019.pdf',
  dataset_number: 10,
  document_type: 'fbi_report',
  original_url: 'https://www.justice.gov/epstein/files/DataSet%2010/FBI_302.pdf',
  file_url: 'https://files.chatfiles.org/documents/DataSet_10/FBI_302.pdf',
  text_url: 'https://files.chatfiles.org/text/DataSet_10/FBI_302.txt',
  ocr_confidence: 0.92,
  page_count: 15,
  file_size_bytes: 2500000,
  created_at: '2024-01-15T10:30:00Z',
  indexed_at: '2024-01-15T12:00:00Z',
  mentioned_names: [
    { name: 'Jeffrey Epstein', frequency: 12 },
    { name: 'Ghislaine Maxwell', frequency: 8 },
  ],
  image_count: 3,
  face_count: 2,
};

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

  // In production, fetch from database
  if (id !== 'doc_001') {
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

  const limits = RATE_LIMITS[auth.data.tier];

  return NextResponse.json(
    {
      data: mockDocument,
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

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
    },
  });
}
