import Link from 'next/link';
import { query } from '@/lib/database';
import { notableNames } from '@/lib/notable-names';

async function getBrowseData() {
  try {
    const [datasets, types] = await Promise.all([
      // Get documents by dataset
      query<{ dataset_number: number; count: string }>(
        `SELECT dataset_number, COUNT(*) as count
         FROM documents
         GROUP BY dataset_number
         ORDER BY dataset_number`
      ),
      // Get documents by type
      query<{ document_type: string; count: string }>(
        `SELECT COALESCE(document_type, 'other') as document_type, COUNT(*) as count
         FROM documents
         GROUP BY document_type
         ORDER BY count DESC`
      ),
    ]);

    return {
      datasets: datasets.map(d => ({
        number: d.dataset_number,
        documents: parseInt(d.count, 10),
      })),
      types: types.map(t => ({
        type: t.document_type,
        count: parseInt(t.count, 10),
      })),
    };
  } catch (error) {
    console.error('Failed to fetch browse data:', error);
    return { datasets: [], types: [] };
  }
}

const typeIcons: Record<string, string> = {
  email: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  court_doc: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3',
  fbi_report: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  transcript: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
  photo: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
  video: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
  document: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
  other: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
};

const typeLabels: Record<string, string> = {
  email: 'Emails',
  court_doc: 'Court Documents',
  fbi_report: 'FBI Reports',
  transcript: 'Transcripts',
  photo: 'Photos',
  video: 'Videos',
  document: 'Documents',
  other: 'Other',
};

export default async function BrowsePage() {
  const data = await getBrowseData();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Ad Banner */}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900">Browse Documents</h1>
          <p className="text-gray-500 mt-1">
            Explore the archive by dataset, document type, or person
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* Browse by Dataset */}
        {data.datasets.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">By Data Set</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.datasets.filter(ds => ds.number !== 0).map((ds) => (
                <Link
                  key={ds.number}
                  href={`/search?datasets=${ds.number}`}
                  className="card card-hover p-5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">Dataset {ds.number}</h3>
                      <p className="text-sm text-accent font-medium mt-2">
                        {ds.documents.toLocaleString()} documents
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-navy/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl font-bold text-navy">{ds.number}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Ad slot */}
        <div className="flex justify-center">
        </div>

        {/* Browse by Type */}
        {data.types.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">By Document Type</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {data.types.map((dt) => (
                <Link
                  key={dt.type}
                  href={`/search?type=${dt.type}`}
                  className="card card-hover p-4 text-center"
                >
                  <div className="w-12 h-12 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-6 h-6 text-navy"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={typeIcons[dt.type] || typeIcons.other}
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {typeLabels[dt.type] || dt.type}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {dt.count.toLocaleString()}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Browse by Person - Using curated notable names */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Notable Names</h2>
            <Link href="/people" className="text-sm text-accent hover:text-accent-hover">
              View All 100 &rarr;
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
              <div className="p-4">
                {notableNames.slice(0, 10).map((person, i) => (
                  <Link
                    key={person.name}
                    href={`/search?q=${encodeURIComponent(person.name)}`}
                    className={`flex items-center justify-between py-2 hover:bg-gray-50 px-2 rounded ${
                      i < 9 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <span className="text-gray-900">{person.name}</span>
                    <span className="text-xs text-gray-500 truncate ml-2 max-w-[150px]">
                      {person.category}
                    </span>
                  </Link>
                ))}
              </div>
              <div className="p-4">
                {notableNames.slice(10, 20).map((person, i) => (
                  <Link
                    key={person.name}
                    href={`/search?q=${encodeURIComponent(person.name)}`}
                    className={`flex items-center justify-between py-2 hover:bg-gray-50 px-2 rounded ${
                      i < 9 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <span className="text-gray-900">{person.name}</span>
                    <span className="text-xs text-gray-500 truncate ml-2 max-w-[150px]">
                      {person.category}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Empty state */}
        {data.datasets.length === 0 && data.types.length === 0 && (
          <div className="text-center py-12">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-500">No documents available yet. Processing in progress...</p>
          </div>
        )}
      </div>
    </div>
  );
}
