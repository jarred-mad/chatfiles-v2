import Link from "next/link";
import SearchBar from "@/components/ui/SearchBar";
import AdSlot, { AdBanner } from "@/components/ui/AdSlot";
import { query } from "@/lib/database";

// Example search chips - these are static suggestions
const exampleSearches = [
  "Jeffrey Epstein",
  "Ghislaine Maxwell",
  "Flight Logs",
  "FBI Report",
  "Deposition",
  "Interview",
];

async function getStats() {
  try {
    const [docCount, imageCount, faceCount, pageSum, byDataset, byType, topNames] = await Promise.all([
      query<{ count: string }>('SELECT COUNT(*) as count FROM documents'),
      query<{ count: string }>('SELECT COUNT(*) as count FROM extracted_images'),
      query<{ count: string }>('SELECT COUNT(*) as count FROM faces'),
      query<{ total: string }>('SELECT COALESCE(SUM(page_count), 0) as total FROM documents'),
      query<{ dataset_number: number; count: string }>(
        'SELECT dataset_number, COUNT(*) as count FROM documents GROUP BY dataset_number ORDER BY dataset_number'
      ),
      query<{ document_type: string; count: string }>(
        'SELECT document_type, COUNT(*) as count FROM documents GROUP BY document_type ORDER BY count DESC'
      ),
      query<{ name: string; total: string }>(
        `SELECT name, SUM(frequency) as total
         FROM mentioned_names
         GROUP BY name
         ORDER BY total DESC
         LIMIT 6`
      ),
    ]);

    return {
      totalDocuments: parseInt(docCount[0]?.count || '0', 10),
      totalPages: parseInt(pageSum[0]?.total || '0', 10),
      totalImages: parseInt(imageCount[0]?.count || '0', 10),
      totalFaces: parseInt(faceCount[0]?.count || '0', 10),
      byDataset: byDataset.map(d => ({ number: d.dataset_number, count: parseInt(d.count, 10) })),
      byType: byType.map(t => ({ type: t.document_type || 'other', count: parseInt(t.count, 10) })),
      topNames: topNames.map(n => ({ name: n.name, count: parseInt(n.total, 10) })),
    };
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return {
      totalDocuments: 0,
      totalPages: 0,
      totalImages: 0,
      totalFaces: 0,
      byDataset: [],
      byType: [],
      topNames: [],
    };
  }
}

async function getRecentDocuments() {
  try {
    const docs = await query<{
      id: string;
      filename: string;
      dataset_number: number;
      document_type: string;
    }>(
      `SELECT id, filename, dataset_number, document_type
       FROM documents
       ORDER BY created_at DESC
       LIMIT 8`
    );
    return docs;
  } catch {
    return [];
  }
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K+`;
  return num.toString();
}

export default async function Home() {
  const stats = await getStats();
  const recentDocs = await getRecentDocuments();

  // Build collections from real data
  const collections = [
    {
      title: "All Documents",
      description: "Browse the complete document archive",
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      href: "/browse",
      count: formatNumber(stats.totalDocuments),
    },
    {
      title: "Photos & Images",
      description: "Extracted photographs from documents",
      icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
      href: "/photos",
      count: formatNumber(stats.totalImages),
    },
    ...stats.byDataset.slice(0, 4).map(ds => ({
      title: `Dataset ${ds.number}`,
      description: `${ds.count.toLocaleString()} documents`,
      icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
      href: `/search?datasets=${ds.number}`,
      count: formatNumber(ds.count),
    })),
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-navy to-navy-light py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Search the DOJ Epstein Files
          </h1>
          <p className="text-gray-300 text-lg md:text-xl mb-8">
            {formatNumber(stats.totalPages)} pages of publicly released government documents,
            fully searchable
          </p>

          {/* Main Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <SearchBar
              placeholder="Search documents, names, keywords..."
              autoFocus
            />
          </div>

          {/* Example Searches */}
          <div className="flex flex-wrap justify-center gap-2">
            {(stats.topNames.length > 0 ? stats.topNames.map(n => n.name) : exampleSearches).map((term) => (
              <Link
                key={term}
                href={`/search?q=${encodeURIComponent(term)}`}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-full transition-colors"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top Banner Ad */}
      <AdBanner id="home-top" className="bg-white border-b" />

      {/* Stats Bar */}
      <section className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl md:text-3xl font-bold text-navy">
                {stats.totalDocuments.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Documents</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-navy">
                {formatNumber(stats.totalPages)}
              </div>
              <div className="text-sm text-gray-500">Total Pages</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-navy">
                {stats.totalImages.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Images Extracted</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-navy">
                {stats.totalFaces.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Faces Detected</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Browse Collections
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <Link
                key={collection.title}
                href={collection.href}
                className="card card-hover p-6 flex items-start gap-4"
              >
                <div className="w-12 h-12 bg-navy/10 rounded-lg flex items-center justify-center flex-shrink-0">
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
                      d={collection.icon}
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {collection.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {collection.description}
                  </p>
                  <p className="text-xs text-accent font-medium mt-2">
                    {collection.count} items
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Ad slot between sections */}
      <div className="flex justify-center py-6 bg-white">
        <AdSlot size="incontent" id="home-middle" />
      </div>

      {/* How It Works */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            How ChatFiles.org Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-navy rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">DOJ Releases Files</h3>
              <p className="text-sm text-gray-500">
                The Department of Justice publicly releases thousands of
                documents as part of the Epstein disclosure.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-navy rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">We Process & Index</h3>
              <p className="text-sm text-gray-500">
                Our pipeline extracts text, identifies names,
                extracts images, and builds a searchable index.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-navy rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">You Search & Explore</h3>
              <p className="text-sm text-gray-500">
                Full-text search across all documents. Find names, keywords,
                and browse photos from the archive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Documents */}
      {recentDocs.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Recent Documents
              </h2>
              <Link
                href="/browse"
                className="text-accent hover:text-accent-hover font-medium text-sm"
              >
                View All &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentDocs.map((doc) => (
                <Link key={doc.id} href={`/documents/${doc.id}`} className="card card-hover p-4">
                  <h3 className="font-medium text-gray-900 truncate text-sm">{doc.filename}</h3>
                  <p className="text-xs text-gray-500 mt-1">Dataset {doc.dataset_number}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="badge badge-other text-xs">{doc.document_type || 'document'}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bottom Banner Ad */}
      <AdBanner id="home-bottom" className="bg-gray-50" />

      {/* CTA Section */}
      <section className="py-12 bg-navy text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Help Us Keep This Archive Free
          </h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            ChatFiles.org is a free public resource. Donations help cover server
            costs and development time. Every contribution makes a difference.
          </p>
          <a
            href="https://ko-fi.com/chatfiles"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311zm6.173.478c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z" />
            </svg>
            Support on Ko-fi
          </a>
        </div>
      </section>
    </div>
  );
}
