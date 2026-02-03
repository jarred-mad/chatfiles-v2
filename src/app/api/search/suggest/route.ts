import { NextRequest, NextResponse } from 'next/server';

// Mock suggestions - will be replaced with Meilisearch
const suggestions = [
  'Jeffrey Epstein',
  'Ghislaine Maxwell',
  'Flight Logs',
  'FBI Report',
  'Prince Andrew',
  'Bill Clinton',
  'Virginia Giuffre',
  'Palm Beach',
  'Little St. James',
  'Deposition',
  'Email',
  'Interview',
  'Testimony',
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  if (query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const lowerQuery = query.toLowerCase();
  const matches = suggestions
    .filter((s) => s.toLowerCase().includes(lowerQuery))
    .slice(0, 5);

  return NextResponse.json({ suggestions: matches });
}
