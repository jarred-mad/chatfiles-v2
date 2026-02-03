import { MeiliSearch, SearchParams, SearchResponse } from 'meilisearch';

// Types
export interface DocumentHit {
  id: string;
  filename: string;
  dataset_number: number;
  document_type: string;
  text_content: string;
  ocr_confidence: number;
  page_count: number;
  file_size_bytes: number;
  mentioned_names: string[];
  file_path_r2?: string;
  _formatted?: {
    text_content?: string;
    filename?: string;
  };
}

export interface SearchFilters {
  datasets?: number[];
  documentType?: string;
  names?: string[];
}

export interface SearchResult {
  results: DocumentHit[];
  total: number;
  page: number;
  totalPages: number;
  processingTimeMs: number;
  query: string;
}

// Singleton client
let client: MeiliSearch | null = null;

function getClient(): MeiliSearch {
  if (!client) {
    const url = process.env.MEILISEARCH_URL || 'http://localhost:7700';
    const apiKey = process.env.MEILISEARCH_API_KEY || '';

    client = new MeiliSearch({
      host: url,
      apiKey,
    });
  }
  return client;
}

const INDEX_NAME = 'documents';

/**
 * Search documents with full-text search and filtering
 */
export async function searchDocuments(
  query: string,
  filters?: SearchFilters,
  page = 1,
  limit = 20,
  sort?: string
): Promise<SearchResult> {
  const meili = getClient();
  const index = meili.index(INDEX_NAME);

  // Build filter string
  const filterParts: string[] = [];

  if (filters?.datasets && filters.datasets.length > 0) {
    filterParts.push(`dataset_number IN [${filters.datasets.join(', ')}]`);
  }

  if (filters?.documentType) {
    filterParts.push(`document_type = "${filters.documentType}"`);
  }

  if (filters?.names && filters.names.length > 0) {
    const nameFilters = filters.names.map((n) => `mentioned_names = "${n}"`);
    filterParts.push(`(${nameFilters.join(' OR ')})`);
  }

  const searchParams: SearchParams = {
    offset: (page - 1) * limit,
    limit,
    attributesToHighlight: ['text_content', 'filename'],
    highlightPreTag: '<mark class="search-highlight">',
    highlightPostTag: '</mark>',
    attributesToCrop: ['text_content'],
    cropLength: 200,
  };

  if (filterParts.length > 0) {
    searchParams.filter = filterParts.join(' AND ');
  }

  if (sort) {
    const sortMap: Record<string, string[]> = {
      dataset: ['dataset_number:asc'],
      filename: ['filename:asc'],
      confidence: ['ocr_confidence:desc'],
      pages: ['page_count:desc'],
    };
    if (sortMap[sort]) {
      searchParams.sort = sortMap[sort];
    }
  }

  try {
    const response: SearchResponse<DocumentHit> = await index.search(query, searchParams);

    return {
      results: response.hits,
      total: response.estimatedTotalHits || 0,
      page,
      totalPages: Math.ceil((response.estimatedTotalHits || 0) / limit),
      processingTimeMs: response.processingTimeMs,
      query,
    };
  } catch (error) {
    console.error('Meilisearch search error:', error);
    // Return empty results on error
    return {
      results: [],
      total: 0,
      page: 1,
      totalPages: 0,
      processingTimeMs: 0,
      query,
    };
  }
}

/**
 * Get autocomplete suggestions
 */
export async function getSuggestions(query: string, limit = 5): Promise<string[]> {
  if (!query || query.length < 2) {
    return [];
  }

  const meili = getClient();
  const index = meili.index(INDEX_NAME);

  try {
    const response = await index.search(query, {
      limit,
      attributesToRetrieve: ['filename', 'mentioned_names'],
    });

    // Extract unique suggestions from filenames and names
    const suggestions = new Set<string>();

    response.hits.forEach((hit) => {
      const doc = hit as unknown as DocumentHit;
      // Add filename if it matches
      if (doc.filename?.toLowerCase().includes(query.toLowerCase())) {
        suggestions.add(doc.filename);
      }
      // Add matching names
      doc.mentioned_names?.forEach((name) => {
        if (name.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(name);
        }
      });
    });

    return Array.from(suggestions).slice(0, limit);
  } catch (error) {
    console.error('Meilisearch suggestions error:', error);
    return [];
  }
}

/**
 * Get a single document by ID
 */
export async function getDocument(id: string): Promise<DocumentHit | null> {
  const meili = getClient();
  const index = meili.index(INDEX_NAME);

  try {
    const doc = await index.getDocument<DocumentHit>(id);
    return doc;
  } catch (error) {
    console.error('Meilisearch getDocument error:', error);
    return null;
  }
}

/**
 * Get index statistics
 */
export async function getIndexStats(): Promise<{
  numberOfDocuments: number;
  isIndexing: boolean;
}> {
  const meili = getClient();
  const index = meili.index(INDEX_NAME);

  try {
    const stats = await index.getStats();
    return {
      numberOfDocuments: stats.numberOfDocuments,
      isIndexing: stats.isIndexing,
    };
  } catch (error) {
    console.error('Meilisearch stats error:', error);
    return {
      numberOfDocuments: 0,
      isIndexing: false,
    };
  }
}

/**
 * Health check
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const meili = getClient();
    await meili.health();
    return true;
  } catch {
    return false;
  }
}
