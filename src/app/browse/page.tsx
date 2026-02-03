import Link from 'next/link';
import AdSlot from '@/components/ui/AdSlot';

// Mock data
const datasets = [
  { number: 8, documents: 1245, description: 'General correspondence and documents', progress: 100 },
  { number: 9, documents: 3421, description: 'Financial records and transactions', progress: 100 },
  { number: 10, documents: 10594, description: 'FBI reports and investigation files', progress: 100 },
  { number: 11, documents: 5678, description: 'Legal proceedings and depositions', progress: 85 },
  { number: 12, documents: 5560, description: 'Photos, videos, and media files', progress: 100 },
];

const documentTypes = [
  { type: 'email', label: 'Emails', count: 15234, icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { type: 'court_doc', label: 'Court Documents', count: 12456, icon: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3' },
  { type: 'fbi_report', label: 'FBI Reports', count: 8567, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { type: 'transcript', label: 'Transcripts', count: 3456, icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
  { type: 'photo', label: 'Photos', count: 45678, icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { type: 'video', label: 'Videos', count: 234, icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
];

const topNames = [
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
];

const collections = [
  { id: 'flight-logs', title: 'Flight Logs', description: 'Aircraft manifests and passenger records', count: 2400 },
  { id: 'financial', title: 'Financial Records', description: 'Bank statements, wire transfers, and transactions', count: 8900 },
  { id: 'communications', title: 'Communications', description: 'Emails, letters, and messages', count: 15000 },
  { id: 'surveillance', title: 'Surveillance Footage', description: 'Security camera recordings and photos', count: 500 },
];

export default function BrowsePage() {
  return (
    <div className="min-h-screen bg-gray-50">
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
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">By Data Set</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {datasets.map((ds) => (
              <Link
                key={ds.number}
                href={`/search?datasets=${ds.number}`}
                className="card card-hover p-5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Dataset {ds.number}</h3>
                    <p className="text-sm text-gray-500 mt-1">{ds.description}</p>
                    <p className="text-sm text-accent font-medium mt-2">
                      {ds.documents.toLocaleString()} documents
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-navy/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-navy">{ds.number}</span>
                  </div>
                </div>
                {ds.progress < 100 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Processing</span>
                      <span>{ds.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full"
                        style={{ width: `${ds.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>

        {/* Ad slot */}
        <div className="flex justify-center">
          <AdSlot size="incontent" id="browse-middle" />
        </div>

        {/* Browse by Type */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">By Document Type</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {documentTypes.map((dt) => (
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
                      d={dt.icon}
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">{dt.label}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {dt.count.toLocaleString()}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Browse by Person */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">By Person</h2>
            <Link href="/search" className="text-sm text-accent hover:text-accent-hover">
              View All &rarr;
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
              <div className="p-4">
                {topNames.slice(0, 5).map((person, i) => (
                  <Link
                    key={person.name}
                    href={`/search?q=${encodeURIComponent(person.name)}`}
                    className={`flex items-center justify-between py-2 hover:bg-gray-50 px-2 rounded ${
                      i < 4 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <span className="text-gray-900">{person.name}</span>
                    <span className="text-sm text-gray-500">
                      {person.count.toLocaleString()} mentions
                    </span>
                  </Link>
                ))}
              </div>
              <div className="p-4">
                {topNames.slice(5, 10).map((person, i) => (
                  <Link
                    key={person.name}
                    href={`/search?q=${encodeURIComponent(person.name)}`}
                    className={`flex items-center justify-between py-2 hover:bg-gray-50 px-2 rounded ${
                      i < 4 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <span className="text-gray-900">{person.name}</span>
                    <span className="text-sm text-gray-500">
                      {person.count.toLocaleString()} mentions
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Curated Collections */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Curated Collections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {collections.map((col) => (
              <Link
                key={col.id}
                href={`/search?collection=${col.id}`}
                className="card card-hover p-5 flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-accent"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{col.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{col.description}</p>
                  <p className="text-xs text-accent font-medium mt-2">
                    {col.count.toLocaleString()} documents
                  </p>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
