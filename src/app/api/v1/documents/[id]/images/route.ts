import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey, RATE_LIMITS } from '@/lib/api-auth';

// Mock images data
const mockImages = [
  {
    id: 'img_001',
    document_id: 'doc_001',
    page_number: 3,
    image_url: 'https://files.chatfiles.org/images/DataSet_10/doc_001_page3_img0.png',
    width: 800,
    height: 600,
    has_faces: true,
    faces: [
      {
        id: 'face_001',
        bounding_box: { x: 100, y: 50, width: 150, height: 180 },
        cluster_id: 'cluster_1',
        cluster_label: 'Jeffrey Epstein',
        confidence: 0.94,
      },
    ],
  },
  {
    id: 'img_002',
    document_id: 'doc_001',
    page_number: 7,
    image_url: 'https://files.chatfiles.org/images/DataSet_10/doc_001_page7_img0.png',
    width: 600,
    height: 400,
    has_faces: false,
    faces: [],
  },
];

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
  const hasFaces = searchParams.get('has_faces');

  // Filter mock data
  let images = mockImages.filter((img) => img.document_id === id);

  if (hasFaces === 'true') {
    images = images.filter((img) => img.has_faces);
  }

  if (images.length === 0 && id !== 'doc_001') {
    return NextResponse.json(
      {
        error: {
          code: 'NOT_FOUND',
          message: `No images found for document '${id}'`,
        },
      },
      { status: 404 }
    );
  }

  const limits = RATE_LIMITS[auth.data.tier];

  return NextResponse.json(
    {
      data: images,
      meta: {
        document_id: id,
        total: images.length,
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
