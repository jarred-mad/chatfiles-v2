import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, RATE_LIMITS } from '@/lib/api-auth';

// Mock cluster detail
const mockCluster = {
  id: 'cluster_1',
  label: 'Jeffrey Epstein',
  sample_image_url: 'https://files.chatfiles.org/faces/clusters/cluster_1/sample.jpg',
  face_count: 245,
  document_count: 89,
  is_known_person: true,
  confidence: 0.98,
  faces: [
    {
      id: 'face_001',
      image_url: 'https://files.chatfiles.org/faces/crops/face_001.jpg',
      document_id: 'doc_001',
      document_filename: 'FBI_302_Interview_Report.pdf',
      page_number: 3,
      confidence: 0.94,
    },
    {
      id: 'face_002',
      image_url: 'https://files.chatfiles.org/faces/crops/face_002.jpg',
      document_id: 'doc_015',
      document_filename: 'Surveillance_Photos_2015.pdf',
      page_number: 1,
      confidence: 0.91,
    },
    {
      id: 'face_003',
      image_url: 'https://files.chatfiles.org/faces/crops/face_003.jpg',
      document_id: 'doc_023',
      document_filename: 'Evidence_Collection.pdf',
      page_number: 5,
      confidence: 0.89,
    },
  ],
  co_occurring_clusters: [
    { id: 'cluster_2', label: 'Ghislaine Maxwell', co_occurrences: 45 },
    { id: 'cluster_3', label: 'Prince Andrew', co_occurrences: 12 },
    { id: 'cluster_4', label: null, co_occurrences: 8 },
  ],
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
  const { searchParams } = new URL(request.url);
  const includeFaces = searchParams.get('include_faces') !== 'false';
  const faceLimit = Math.min(parseInt(searchParams.get('face_limit') || '50', 10), 200);

  // In production, fetch from database
  if (id !== 'cluster_1') {
    return NextResponse.json(
      {
        error: {
          code: 'NOT_FOUND',
          message: `Face cluster with id '${id}' not found`,
        },
      },
      { status: 404 }
    );
  }

  const response = {
    ...mockCluster,
    faces: includeFaces ? mockCluster.faces.slice(0, faceLimit) : undefined,
  };

  const limits = RATE_LIMITS[auth.data.tier];

  return NextResponse.json(
    {
      data: response,
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
