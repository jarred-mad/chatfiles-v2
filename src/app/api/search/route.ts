import { NextRequest, NextResponse } from 'next/server';

// Mock data for development - will be replaced with Meilisearch
const mockResults = [
  {
    id: 'doc_001',
    filename: 'FBI_302_Interview_Report_2019.pdf',
    dataset_number: 10,
    document_type: 'fbi_report',
    text_content: 'This document contains an FBI 302 interview report from 2019. The subject discussed various matters related to the investigation...',
    ocr_confidence: 0.92,
    page_count: 15,
    mentioned_names: ['Jeffrey Epstein', 'Ghislaine Maxwell'],
  },
  {
    id: 'doc_002',
    filename: 'Deposition_Transcript_Vol1.pdf',
    dataset_number: 12,
    document_type: 'transcript',
    text_content: 'Deposition transcript of witness testimony. Q: Please state your name for the record. A: ...',
    ocr_confidence: 0.88,
    page_count: 45,
    mentioned_names: ['Prince Andrew', 'Virginia Giuffre'],
  },
  {
    id: 'doc_003',
    filename: 'Email_Communications_2015.pdf',
    dataset_number: 8,
    document_type: 'email',
    text_content: 'From: example@email.com To: recipient@email.com Subject: Meeting scheduled...',
    ocr_confidence: 0.95,
    page_count: 3,
    mentioned_names: [],
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const type = searchParams.get('type');
  const datasets = searchParams.get('datasets')?.split(',').map(Number);
  const sort = searchParams.get('sort') || 'relevance';

  const startTime = Date.now();

  try {
    // In production, this would use Meilisearch
    // For now, return mock data filtered by query
    let results = [...mockResults];

    // Filter by query (simple substring match)
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(
        (doc) =>
          doc.filename.toLowerCase().includes(lowerQuery) ||
          doc.text_content.toLowerCase().includes(lowerQuery) ||
          doc.mentioned_names.some((name) =>
            name.toLowerCase().includes(lowerQuery)
          )
      );
    }

    // Filter by type
    if (type) {
      results = results.filter((doc) => doc.document_type === type);
    }

    // Filter by datasets
    if (datasets && datasets.length > 0) {
      results = results.filter((doc) => datasets.includes(doc.dataset_number));
    }

    // Sort
    if (sort === 'dataset') {
      results.sort((a, b) => a.dataset_number - b.dataset_number);
    } else if (sort === 'filename') {
      results.sort((a, b) => a.filename.localeCompare(b.filename));
    } else if (sort === 'confidence') {
      results.sort((a, b) => b.ocr_confidence - a.ocr_confidence);
    }

    // Pagination
    const total = results.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedResults = results.slice(startIndex, startIndex + limit);

    // Add highlighting (mock)
    const highlightedResults = paginatedResults.map((doc) => ({
      ...doc,
      _formatted: {
        text_content: query
          ? doc.text_content.replace(
              new RegExp(`(${query})`, 'gi'),
              '<mark class="search-highlight">$1</mark>'
            )
          : doc.text_content,
      },
    }));

    return NextResponse.json({
      results: highlightedResults,
      total,
      page,
      totalPages,
      processingTimeMs: Date.now() - startTime,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
