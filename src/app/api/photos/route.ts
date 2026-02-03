import { NextRequest, NextResponse } from 'next/server';

// Mock photo data
const mockPhotos = Array.from({ length: 100 }, (_, i) => ({
  id: `photo_${i + 1}`,
  document_id: `doc_${Math.floor(i / 5) + 1}`,
  document_filename: `Document_${Math.floor(i / 5) + 1}.pdf`,
  page_number: (i % 10) + 1,
  image_path_r2: `/images/DataSet_${8 + (i % 5)}/photo_${i + 1}.png`,
  width: 600 + Math.floor(Math.random() * 400),
  height: 400 + Math.floor(Math.random() * 400),
  has_faces: i % 4 === 0,
  dataset_number: 8 + (i % 5),
  faces: i % 4 === 0 ? [
    {
      id: `face_${i}_1`,
      cluster_id: `cluster_${(i % 6) + 1}`,
      cluster_label: i % 6 < 3 ? ['Jeffrey Epstein', 'Ghislaine Maxwell', 'Prince Andrew'][i % 3] : null,
      bounding_box: { x: 100, y: 50, width: 120, height: 150 },
      confidence: 0.85 + Math.random() * 0.1,
    }
  ] : [],
}));

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const dataset = searchParams.get('dataset');
  const person = searchParams.get('person'); // cluster_id
  const documentId = searchParams.get('document');
  const hasFaces = searchParams.get('has_faces');

  let results = [...mockPhotos];

  // Filter by dataset
  if (dataset) {
    const dsNum = parseInt(dataset, 10);
    results = results.filter((p) => p.dataset_number === dsNum);
  }

  // Filter by document
  if (documentId) {
    results = results.filter((p) => p.document_id === documentId);
  }

  // Filter by person (cluster)
  if (person) {
    results = results.filter((p) =>
      p.faces.some((f) => f.cluster_id === person)
    );
  }

  // Filter by has_faces
  if (hasFaces === 'true') {
    results = results.filter((p) => p.has_faces);
  }

  // Pagination
  const total = results.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const paginatedResults = results.slice(startIndex, startIndex + limit);

  return NextResponse.json({
    results: paginatedResults,
    total,
    page,
    totalPages,
    limit,
  });
}
