import { NextRequest, NextResponse } from 'next/server';

// Mock cluster data
const mockClusters = [
  {
    id: 'cluster_1',
    label: 'Jeffrey Epstein',
    sample_image_path: '/faces/clusters/cluster_1/sample.jpg',
    face_count: 245,
    is_known_person: true,
    match_confidence: 0.98,
    documents_count: 89,
  },
  {
    id: 'cluster_2',
    label: 'Ghislaine Maxwell',
    sample_image_path: '/faces/clusters/cluster_2/sample.jpg',
    face_count: 178,
    is_known_person: true,
    match_confidence: 0.96,
    documents_count: 67,
  },
  {
    id: 'cluster_3',
    label: 'Prince Andrew',
    sample_image_path: '/faces/clusters/cluster_3/sample.jpg',
    face_count: 45,
    is_known_person: true,
    match_confidence: 0.92,
    documents_count: 23,
  },
  {
    id: 'cluster_4',
    label: 'Virginia Giuffre',
    sample_image_path: '/faces/clusters/cluster_4/sample.jpg',
    face_count: 67,
    is_known_person: true,
    match_confidence: 0.94,
    documents_count: 34,
  },
  {
    id: 'cluster_5',
    label: 'Alan Dershowitz',
    sample_image_path: '/faces/clusters/cluster_5/sample.jpg',
    face_count: 23,
    is_known_person: true,
    match_confidence: 0.91,
    documents_count: 12,
  },
  // Unknown persons
  {
    id: 'cluster_6',
    label: null,
    sample_image_path: '/faces/clusters/cluster_6/sample.jpg',
    face_count: 89,
    is_known_person: false,
    match_confidence: null,
    documents_count: 45,
  },
  {
    id: 'cluster_7',
    label: null,
    sample_image_path: '/faces/clusters/cluster_7/sample.jpg',
    face_count: 56,
    is_known_person: false,
    match_confidence: null,
    documents_count: 28,
  },
  {
    id: 'cluster_8',
    label: null,
    sample_image_path: '/faces/clusters/cluster_8/sample.jpg',
    face_count: 34,
    is_known_person: false,
    match_confidence: null,
    documents_count: 17,
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const knownOnly = searchParams.get('known_only') === 'true';

  let results = [...mockClusters];

  // Filter by known persons only
  if (knownOnly) {
    results = results.filter((c) => c.is_known_person);
  }

  // Sort: known persons first, then by face count
  results.sort((a, b) => {
    if (a.is_known_person !== b.is_known_person) {
      return a.is_known_person ? -1 : 1;
    }
    return b.face_count - a.face_count;
  });

  // Pagination
  const total = results.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const paginatedResults = results.slice(startIndex, startIndex + limit);

  return NextResponse.json({
    clusters: paginatedResults,
    total,
    page,
    totalPages,
    summary: {
      total_clusters: mockClusters.length,
      known_persons: mockClusters.filter((c) => c.is_known_person).length,
      unknown_persons: mockClusters.filter((c) => !c.is_known_person).length,
      total_faces: mockClusters.reduce((sum, c) => sum + c.face_count, 0),
    },
  });
}
