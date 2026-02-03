import { NextResponse } from 'next/server';

// Public stats endpoint - no API key required
export async function GET() {
  const stats = {
    archive: {
      total_documents: 26498,
      total_pages: 935000,
      total_images: 45678,
      total_faces: 12345,
      total_clusters: 1234,
      known_persons: 89,
      datasets: [8, 9, 10, 11, 12],
    },
    document_types: {
      email: 15234,
      court_doc: 12456,
      fbi_report: 8567,
      transcript: 3456,
      photo: 45678,
      video: 234,
      other: 5123,
    },
    processing: {
      ocr_complete: true,
      image_extraction_complete: true,
      face_detection_complete: true,
      indexing_complete: true,
      last_updated: '2024-01-20T15:30:00Z',
    },
    api: {
      version: 'v1',
      docs_url: 'https://chatfiles.org/api/docs',
    },
  };

  return NextResponse.json(
    { data: stats },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
