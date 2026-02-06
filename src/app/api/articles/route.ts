import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export const dynamic = 'force-dynamic';

interface Article {
  id: number;
  slug: string;
  person_name: string;
  title: string;
  summary: string;
  category: string;
  image_url: string;
  document_count: number;
  is_featured: boolean;
  published_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const category = searchParams.get('category');
    const offset = (page - 1) * limit;

    // Build query with optional category filter
    let whereClause = '';
    const params: (string | number)[] = [];

    if (category) {
      whereClause = 'WHERE category = $1';
      params.push(category);
    }

    // Get articles
    const articles = await query<Article>(
      `SELECT id, slug, person_name, title, summary, category, image_url, document_count, is_featured, published_at
       FROM articles
       ${whereClause}
       ORDER BY is_featured DESC, published_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    // Get total count
    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM articles ${whereClause}`,
      params
    );
    const total = parseInt(countResult[0]?.count || '0');

    // Get categories with counts
    const categories = await query<{ category: string; count: string }>(
      `SELECT category, COUNT(*) as count FROM articles GROUP BY category ORDER BY count DESC`
    );

    return NextResponse.json({
      articles,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      categories: categories.map(c => ({ name: c.category, count: parseInt(c.count) })),
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}
