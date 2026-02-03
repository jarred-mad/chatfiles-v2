import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const searchQuery = searchParams.get('q') || '';

  if (searchQuery.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    // Get suggestions from mentioned names and filenames
    const suggestions: string[] = [];

    // Search mentioned names
    const namesResult = await query<{ name: string; total: string }>(
      `SELECT name, SUM(frequency) as total
       FROM mentioned_names
       WHERE name ILIKE $1
       GROUP BY name
       ORDER BY total DESC
       LIMIT 5`,
      [`%${searchQuery}%`]
    );
    suggestions.push(...namesResult.map(r => r.name));

    // Search filenames if we need more suggestions
    if (suggestions.length < 5) {
      const filesResult = await query<{ filename: string }>(
        `SELECT DISTINCT filename
         FROM documents
         WHERE filename ILIKE $1
         LIMIT $2`,
        [`%${searchQuery}%`, 5 - suggestions.length]
      );
      suggestions.push(...filesResult.map(r => r.filename));
    }

    return NextResponse.json({ suggestions: suggestions.slice(0, 8) });
  } catch (error) {
    console.error('Suggest error:', error);
    return NextResponse.json({ suggestions: [] });
  }
}
