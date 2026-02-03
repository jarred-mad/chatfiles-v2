import { NextRequest, NextResponse } from 'next/server';

// Mock document data - will be replaced with database queries
const mockDocuments: Record<string, object> = {
  doc_001: {
    id: 'doc_001',
    filename: 'FBI_302_Interview_Report_2019.pdf',
    dataset_number: 10,
    document_type: 'fbi_report',
    original_url: 'https://www.justice.gov/epstein/files/DataSet%2010/FBI_302_Interview_Report_2019.pdf',
    file_path_r2: '/documents/DataSet_10/FBI_302_Interview_Report_2019.pdf',
    text_content: `FBI 302 INTERVIEW REPORT

Date: March 15, 2019
Location: Palm Beach, Florida

SUBJECT: Interview regarding [REDACTED]

The interview was conducted pursuant to the ongoing investigation...`,
    ocr_confidence: 0.92,
    page_count: 15,
    file_size_bytes: 2500000,
    created_at: '2024-01-15T10:30:00Z',
    indexed_at: '2024-01-15T12:00:00Z',
    mentioned_names: [
      { name: 'Jeffrey Epstein', frequency: 12 },
      { name: 'Ghislaine Maxwell', frequency: 8 },
      { name: 'Virginia Giuffre', frequency: 5 },
    ],
    extracted_images: [
      {
        id: 'img_001',
        page_number: 3,
        image_path_r2: '/images/DataSet_10/doc_001_page3_img0.png',
        width: 800,
        height: 600,
        has_faces: true,
      },
      {
        id: 'img_002',
        page_number: 7,
        image_path_r2: '/images/DataSet_10/doc_001_page7_img0.png',
        width: 600,
        height: 400,
        has_faces: false,
      },
    ],
    faces: [
      {
        id: 'face_001',
        image_id: 'img_001',
        bounding_box: { x: 100, y: 50, width: 150, height: 180 },
        cluster_id: 'cluster_1',
        cluster_label: 'Jeffrey Epstein',
        confidence: 0.94,
        face_crop_path: '/faces/crops/face_001.jpg',
      },
    ],
  },
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // In production, fetch from database
  const document = mockDocuments[id];

  if (!document) {
    return NextResponse.json(
      { error: 'Document not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(document);
}
