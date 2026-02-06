'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense, useMemo } from 'react';
import Link from 'next/link';
import SearchBar from '@/components/ui/SearchBar';
import { notableNames, getCategoryInfo, type NotablePerson } from '@/lib/notable-names';

interface SearchResult {
  id: string;
  filename: string;
  dataset_number: number;
  document_type: string;
  text_content: string;
  ocr_confidence: number;
  page_count: number;
  mentioned_names: string[];
  _formatted?: {
    text_content?: string;
  };
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  totalPages: number;
  processingTimeMs: number;
}

const DOCUMENT_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'email', label: 'Emails' },
  { value: 'court_doc', label: 'Court Documents' },
  { value: 'fbi_report', label: 'FBI Reports' },
  { value: 'transcript', label: 'Transcripts' },
  { value: 'photo', label: 'Photos' },
  { value: 'video', label: 'Videos' },
  { value: 'other', label: 'Other' },
];

const DATASETS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'dataset', label: 'Dataset' },
  { value: 'filename', label: 'Filename' },
  { value: 'confidence', label: 'OCR Confidence' },
];

// Find a notable person matching the search query
function findNotablePerson(query: string): NotablePerson | null {
  if (!query || query.length < 3) return null;
  const normalizedQuery = query.toLowerCase().trim();

  // Exact match first
  const exactMatch = notableNames.find(
    p => p.name.toLowerCase() === normalizedQuery
  );
  if (exactMatch) return exactMatch;

  // Partial match (query contains full name or name contains query)
  const partialMatch = notableNames.find(
    p => p.name.toLowerCase().includes(normalizedQuery) ||
         normalizedQuery.includes(p.name.toLowerCase())
  );
  return partialMatch || null;
}

// Person Synopsis Component
function PersonSynopsis({ person, documentCount }: { person: NotablePerson; documentCount: number }) {
  const categoryInfo = getCategoryInfo(person.category);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
      {/* Header */}
      <div className="bg-navy text-white px-6 py-4">
        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 rounded text-xs font-medium ${categoryInfo?.color || 'bg-gray-500'}`}>
            {person.category}
          </span>
          <h2 className="text-xl font-bold">{person.name}</h2>
        </div>
      </div>

      {/* Synopsis */}
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Synopsis
        </h3>
        <p className="text-gray-700 leading-relaxed">
          {person.description}
        </p>
        {documentCount > 0 && (
          <p className="mt-3 text-sm text-gray-500">
            Found in <span className="font-semibold text-navy">{documentCount.toLocaleString()}</span> document{documentCount !== 1 ? 's' : ''} in the Epstein Files.
          </p>
        )}
      </div>

      {/* Context of Involvement */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Context of Mentions
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          Names appear in these files through various contexts including: contact books and phone directories,
          flight logs, email correspondence, photographs, FBI tip-line reports (often unverified),
          court documents, deposition transcripts, financial records, and social correspondence.
          The nature of each mention varies significantly and should be evaluated individually.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="px-6 py-4 bg-amber-50 border-t border-amber-100">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h4 className="text-sm font-semibold text-amber-800 mb-1">Important Disclaimer</h4>
            <p className="text-sm text-amber-700 leading-relaxed">
              <strong>Being mentioned in these files does not indicate wrongdoing or criminal conduct.</strong> Many
              individuals appear solely as contacts, acquaintances, or in incidental references. Some mentions
              come from unverified FBI hotline tips that were never corroborated. Apart from Ghislaine Maxwell,
              none of the individuals listed on this site have been charged with crimes connected to the Epstein
              investigation. This information is provided for transparency and public interest research purposes only.
            </p>
          </div>
        </div>
      </div>

      {/* Legal Notice */}
      <div className="px-6 py-3 bg-gray-100 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Source: U.S. Department of Justice releases under the Epstein Files Transparency Act (Dec 2025 - Jan 2026).
          This synopsis is compiled from publicly available information and does not constitute legal findings or accusations.
        </p>
      </div>
    </div>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || '';
  const datasets = searchParams.get('datasets')?.split(',').map(Number) || [];
  const sort = searchParams.get('sort') || 'relevance';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [processingTime, setProcessingTime] = useState(0);

  // Filters state
  const [selectedType, setSelectedType] = useState(type);
  const [selectedDatasets, setSelectedDatasets] = useState<number[]>(datasets);
  const [selectedSort, setSelectedSort] = useState(sort);
  const [showFilters, setShowFilters] = useState(false);

  // Check if query matches a notable person
  const matchedPerson = useMemo(() => findNotablePerson(query), [query]);

  // Fetch search results (also works without query to browse all)
  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: '20',
          sort: selectedSort,
        });
        if (query) params.set('q', query);
        if (selectedType) params.set('type', selectedType);
        if (selectedDatasets.length > 0) {
          params.set('datasets', selectedDatasets.join(','));
        }

        const res = await fetch(`/api/search?${params}`);
        if (res.ok) {
          const data: SearchResponse = await res.json();
          setResults(data.results);
          setTotal(data.total);
          setTotalPages(data.totalPages);
          setProcessingTime(data.processingTimeMs);

          // Track search for article ideas (only on first page)
          if (query && page === 1 && data.total > 0) {
            fetch('/api/recent-searches', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                searchTerm: query,
                resultCount: data.total,
              }),
            }).catch(() => {});
          }
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, page, selectedType, selectedDatasets, selectedSort]);

  const updateFilters = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    // Reset to page 1 when changing filters
    params.set('page', '1');
    router.push(`/search?${params.toString()}`, { scroll: false });
  };

  const goToPage = (pageNum: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(pageNum));
    router.push(`/search?${params.toString()}`, { scroll: false });
  };

  const toggleDataset = (ds: number) => {
    const newDatasets = selectedDatasets.includes(ds)
      ? selectedDatasets.filter((d) => d !== ds)
      : [...selectedDatasets, ds];
    setSelectedDatasets(newDatasets);
    updateFilters({ datasets: newDatasets.join(',') });
  };

  const getTypeBadgeClass = (docType: string) => {
    const classes: Record<string, string> = {
      email: 'badge-email',
      court_doc: 'badge-court',
      fbi_report: 'badge-fbi',
      photo: 'badge-photo',
      video: 'badge-video',
      transcript: 'badge-transcript',
    };
    return classes[docType] || 'badge-other';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Ad Banner */}

      {/* Search Header */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-2xl">
            <SearchBar initialQuery={query} placeholder="Search documents..." />
          </div>
          {total > 0 && (
            <div className="mt-4 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="font-medium text-gray-900">
                  Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, total)} of {total.toLocaleString()} Results
                </span>
                {query && <span>for &quot;{query}&quot;</span>}
                <span className="text-gray-400">({processingTime}ms)</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden w-full flex items-center justify-between p-4 bg-white rounded-lg shadow-sm mb-4"
            >
              <span className="font-medium">Filters</span>
              <svg
                className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              {/* Document Type Filter */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Document Type</h3>
                <select
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value);
                    updateFilters({ type: e.target.value });
                  }}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                >
                  {DOCUMENT_TYPES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dataset Filter */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Data Set</h3>
                <div className="space-y-2">
                  {DATASETS.map((ds) => (
                    <label key={ds} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedDatasets.includes(ds)}
                        onChange={() => toggleDataset(ds)}
                        className="rounded border-gray-300 text-accent focus:ring-accent"
                      />
                      <span className="text-sm">Dataset {ds}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Sort By</h3>
                <select
                  value={selectedSort}
                  onChange={(e) => {
                    setSelectedSort(e.target.value);
                    updateFilters({ sort: e.target.value });
                  }}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ad slot */}
            </div>
          </aside>

          {/* Results */}
          <main className="flex-1">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/4 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-100 rounded"></div>
                      <div className="h-3 bg-gray-100 rounded w-5/6"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                {query ? (
                  <>
                    <svg
                      className="w-16 h-16 text-gray-300 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                    <p className="text-gray-500 mb-4">
                      We couldn&apos;t find any documents matching &quot;{query}&quot;
                    </p>
                    <div className="text-sm text-gray-400">
                      <p>Suggestions:</p>
                      <ul className="list-disc list-inside mt-2">
                        <li>Check your spelling</li>
                        <li>Try different keywords</li>
                        <li>Remove some filters</li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-16 h-16 text-gray-300 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Start searching</h3>
                    <p className="text-gray-500">
                      Enter a search term to find documents
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Person Synopsis for Notable Names */}
                {matchedPerson && (
                  <PersonSynopsis person={matchedPerson} documentCount={total} />
                )}

                {results.map((result, index) => (
                  <div key={result.id}>
                    <Link
                      href={`/documents/${result.id}`}
                      className="block bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate hover:text-accent">
                            {result.filename}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`badge ${getTypeBadgeClass(result.document_type)}`}>
                              {result.document_type.replace('_', ' ')}
                            </span>
                            <span className="text-xs text-gray-400">
                              Dataset {result.dataset_number}
                            </span>
                            <span className="text-xs text-gray-400">
                              {result.page_count} pages
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <span className="text-xs text-gray-400">
                            {Math.round(result.ocr_confidence * 100)}% OCR
                          </span>
                        </div>
                      </div>

                      {/* Excerpt */}
                      <div
                        className="mt-3 text-sm text-gray-600 line-clamp-3"
                        dangerouslySetInnerHTML={{
                          __html:
                            result._formatted?.text_content?.substring(0, 300) ||
                            result.text_content?.substring(0, 300) + '...',
                        }}
                      />

                      {/* Mentioned names */}
                      {result.mentioned_names && result.mentioned_names.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {result.mentioned_names.slice(0, 5).map((name) => (
                            <span
                              key={name}
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                            >
                              {name}
                            </span>
                          ))}
                          {result.mentioned_names.length > 5 && (
                            <span className="text-xs text-gray-400">
                              +{result.mentioned_names.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                    </Link>

                    {/* Ad every 5th result on mobile */}
                    {(index + 1) % 5 === 0 && (
                      <div className="my-4 flex justify-center lg:hidden">
                      </div>
                    )}
                  </div>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col items-center gap-4 pt-6">
                    <div className="flex items-center gap-1 flex-wrap justify-center">
                      {(() => {
                        const pages: (number | string)[] = [];

                        if (totalPages <= 7) {
                          // Show all pages
                          for (let i = 1; i <= totalPages; i++) pages.push(i);
                        } else {
                          // Always show first page
                          pages.push(1);

                          if (page > 4) pages.push('...');

                          // Pages around current
                          const start = Math.max(2, page - 1);
                          const end = Math.min(totalPages - 1, page + 1);
                          for (let i = start; i <= end; i++) pages.push(i);

                          if (page < totalPages - 3) pages.push('...');

                          // Always show last page
                          pages.push(totalPages);
                        }

                        return pages.map((pageNum, idx) =>
                          pageNum === '...' ? (
                            <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">...</span>
                          ) : (
                            <button
                              key={pageNum}
                              onClick={() => goToPage(pageNum as number)}
                              className={`px-3 py-2 rounded-md text-sm font-medium ${
                                page === pageNum
                                  ? 'bg-navy text-white'
                                  : 'border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          )
                        );
                      })()}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => goToPage(page - 1)}
                        disabled={page === 1}
                        className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        &larr; Previous
                      </button>
                      <span className="text-sm text-gray-500">
                        Page {page} of {totalPages}
                      </span>
                      <button
                        onClick={() => goToPage(page + 1)}
                        disabled={page === totalPages}
                        className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Next &rarr;
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy"></div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
