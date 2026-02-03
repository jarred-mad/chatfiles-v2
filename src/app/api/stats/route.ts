import { NextResponse } from 'next/server';

// Mock stats - will be replaced with database queries
const stats = {
  total_documents: 26498,
  total_indexed: 26498,
  total_pages: 935000,
  total_images: 45678,
  total_faces: 12345,
  total_clusters: 1234,
  known_persons: 89,
  unknown_persons: 1145,
  documents_by_dataset: [
    { dataset_number: 8, count: 1245, description: 'General correspondence' },
    { dataset_number: 9, count: 3421, description: 'Financial records' },
    { dataset_number: 10, count: 10594, description: 'FBI reports' },
    { dataset_number: 11, count: 5678, description: 'Legal proceedings' },
    { dataset_number: 12, count: 5560, description: 'Media files' },
  ],
  documents_by_type: [
    { type: 'email', label: 'Emails', count: 15234 },
    { type: 'court_doc', label: 'Court Documents', count: 12456 },
    { type: 'fbi_report', label: 'FBI Reports', count: 8567 },
    { type: 'transcript', label: 'Transcripts', count: 3456 },
    { type: 'photo', label: 'Photos', count: 45678 },
    { type: 'video', label: 'Videos', count: 234 },
    { type: 'other', label: 'Other', count: 5123 },
  ],
  processing_status: {
    ocr_complete: true,
    image_extraction_complete: true,
    face_detection_complete: true,
    indexing_complete: true,
    last_updated: '2024-01-20T15:30:00Z',
  },
  top_mentioned_names: [
    { name: 'Jeffrey Epstein', count: 15678 },
    { name: 'Ghislaine Maxwell', count: 8945 },
    { name: 'Virginia Giuffre', count: 4567 },
    { name: 'Alan Dershowitz', count: 2345 },
    { name: 'Prince Andrew', count: 1890 },
    { name: 'Bill Clinton', count: 1234 },
    { name: 'Donald Trump', count: 987 },
    { name: 'Les Wexner', count: 876 },
    { name: 'Jean-Luc Brunel', count: 654 },
    { name: 'Sarah Kellen', count: 543 },
  ],
};

export async function GET() {
  // Cache this response for 5 minutes
  return NextResponse.json(stats, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
