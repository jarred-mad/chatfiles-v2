import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL?.trim() || 'https://pub-e8b8792b476a4216b2cbd491f9d61af0.r2.dev';

interface RecentSearchRow {
  id: number;
  search_term: string;
  normalized_term: string;
  result_count: number;
  photo_url: string | null;
  search_count: number;
  last_searched_at: string;
}

// Ensure table exists
async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS recent_searches (
      id SERIAL PRIMARY KEY,
      search_term VARCHAR(255) NOT NULL,
      normalized_term VARCHAR(255) NOT NULL,
      result_count INTEGER NOT NULL DEFAULT 0,
      photo_url TEXT,
      is_person BOOLEAN DEFAULT TRUE,
      search_count INTEGER DEFAULT 1,
      first_searched_at TIMESTAMP DEFAULT NOW(),
      last_searched_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Create unique index if not exists (wrapped in try-catch)
  try {
    await query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_recent_searches_unique ON recent_searches(normalized_term)`);
  } catch {
    // Index might already exist
  }
}

// GET - Fetch recent searches
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 50);

  try {
    await ensureTable();

    const results = await query<RecentSearchRow>(`
      SELECT id, search_term, normalized_term, result_count, photo_url, search_count, last_searched_at
      FROM recent_searches
      WHERE result_count > 0
      ORDER BY last_searched_at DESC
      LIMIT $1
    `, [limit]);

    return NextResponse.json({
      searches: results.map(r => ({
        id: r.id,
        name: r.search_term,
        resultCount: r.result_count,
        photoUrl: r.photo_url,
        searchCount: r.search_count,
        lastSearchedAt: r.last_searched_at,
      })),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Recent searches GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent searches' },
      { status: 500 }
    );
  }
}

// POST - Log a new search
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchTerm, resultCount } = body;

    if (!searchTerm || typeof searchTerm !== 'string') {
      return NextResponse.json({ error: 'searchTerm required' }, { status: 400 });
    }

    // Skip if no results or very short term
    if (resultCount <= 0 || searchTerm.trim().length < 2) {
      return NextResponse.json({ success: false, reason: 'skipped' });
    }

    await ensureTable();

    const normalized = searchTerm.trim().toLowerCase();
    const displayTerm = searchTerm.trim();

    // Check if we have a reference photo for this person
    let photoUrl: string | null = null;

    // Try to find a matching reference photo
    const photoName = displayTerm.replace(/\s+/g, '_');
    const possiblePhoto = `${R2_PUBLIC_URL}/reference_photos/${photoName}.jpg`;

    // Check face_clusters for a known person photo
    const clusterResult = await query<{ sample_image_path: string | null }>(`
      SELECT sample_image_path FROM face_clusters
      WHERE LOWER(label) = $1 AND sample_image_path IS NOT NULL
      LIMIT 1
    `, [normalized]);

    if (clusterResult.length > 0 && clusterResult[0].sample_image_path) {
      photoUrl = clusterResult[0].sample_image_path.startsWith('http')
        ? clusterResult[0].sample_image_path
        : `${R2_PUBLIC_URL}/${clusterResult[0].sample_image_path}`;
    } else {
      // Use reference photo URL (will be validated client-side)
      photoUrl = possiblePhoto;
    }

    // Upsert: insert or update if exists
    await query(`
      INSERT INTO recent_searches (search_term, normalized_term, result_count, photo_url, search_count, last_searched_at)
      VALUES ($1, $2, $3, $4, 1, NOW())
      ON CONFLICT (normalized_term) DO UPDATE SET
        result_count = GREATEST(recent_searches.result_count, $3),
        photo_url = COALESCE($4, recent_searches.photo_url),
        search_count = recent_searches.search_count + 1,
        last_searched_at = NOW()
    `, [displayTerm, normalized, resultCount, photoUrl]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Recent searches POST error:', error);
    return NextResponse.json(
      { error: 'Failed to log search' },
      { status: 500 }
    );
  }
}
