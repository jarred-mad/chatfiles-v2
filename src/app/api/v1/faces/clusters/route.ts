import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, RATE_LIMITS } from '@/lib/api-auth';

// Mock clusters
const mockClusters = [
  {
    id: 'cluster_1',
    label: 'Jeffrey Epstein',
    sample_image_url: 'https://files.chatfiles.org/faces/clusters/cluster_1/sample.jpg',
    face_count: 245,
    document_count: 89,
    is_known_person: true,
    confidence: 0.98,
  },
  {
    id: 'cluster_2',
    label: 'Ghislaine Maxwell',
    sample_image_url: 'https://files.chatfiles.org/faces/clusters/cluster_2/sample.jpg',
    face_count: 178,
    document_count: 67,
    is_known_person: true,
    confidence: 0.96,
  },
  {
    id: 'cluster_3',
    label: 'Prince Andrew',
    sample_image_url: 'https://files.chatfiles.org/faces/clusters/cluster_3/sample.jpg',
    face_count: 45,
    document_count: 23,
    is_known_person: true,
    confidence: 0.92,
  },
  {
    id: 'cluster_4',
    label: null,
    sample_image_url: 'https://files.chatfiles.org/faces/clusters/cluster_4/sample.jpg',
    face_count: 89,
    document_count: 45,
    is_known_person: false,
    confidence: null,
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
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
  const knownOnly = searchParams.get('known_only') === 'true';

  let clusters = [...mockClusters];

  if (knownOnly) {
    clusters = clusters.filter((c) => c.is_known_person);
  }

  // Sort: known first, then by face count
  clusters.sort((a, b) => {
    if (a.is_known_person !== b.is_known_person) {
      return a.is_known_person ? -1 : 1;
    }
    return b.face_count - a.face_count;
  });

  const total = clusters.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const paginatedClusters = clusters.slice(startIndex, startIndex + limit);

  const limits = RATE_LIMITS[auth.data.tier];

  return NextResponse.json(
    {
      data: paginatedClusters,
      meta: {
        total,
        page,
        limit,
        total_pages: totalPages,
        known_persons: mockClusters.filter((c) => c.is_known_person).length,
        unknown_persons: mockClusters.filter((c) => !c.is_known_person).length,
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

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
    },
  });
}
