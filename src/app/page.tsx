import Link from "next/link";
import SearchBar from "@/components/ui/SearchBar";
import AdSlot from "@/components/ui/AdSlot";

// Example search chips
const exampleSearches = [
  "Jeffrey Epstein",
  "Ghislaine Maxwell",
  "Flight Logs",
  "FBI Report",
  "Bill Clinton",
  "Prince Andrew",
];

// Featured collections
const collections = [
  {
    title: "Flight Logs",
    description: "Aircraft manifests and passenger records",
    icon: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8",
    href: "/search?q=flight+logs&type=other",
    count: "2,400+",
  },
  {
    title: "FBI 302 Reports",
    description: "FBI interview summaries and reports",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    href: "/search?type=fbi_report",
    count: "8,500+",
  },
  {
    title: "Court Depositions",
    description: "Legal testimony and court documents",
    icon: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3",
    href: "/search?type=court_doc",
    count: "12,000+",
  },
  {
    title: "Photos & Images",
    description: "Extracted photographs and documents",
    icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
    href: "/photos",
    count: "45,000+",
  },
  {
    title: "Emails",
    description: "Email correspondence and communications",
    icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    href: "/search?type=email",
    count: "15,000+",
  },
  {
    title: "Video Footage",
    description: "Surveillance and documentary videos",
    icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
    href: "/videos",
    count: "200+",
  },
];

// Stats (will be fetched from API in production)
const stats = {
  totalDocuments: "26,498",
  totalPages: "935,000+",
  totalImages: "45,000+",
  totalFaces: "12,000+",
};

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-navy to-navy-light py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Search the DOJ Epstein Files
          </h1>
          <p className="text-gray-300 text-lg md:text-xl mb-8">
            {stats.totalPages} pages of publicly released government documents,
            fully OCR&apos;d and searchable
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
            {exampleSearches.map((term) => (
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

      {/* Stats Bar */}
      <section className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl md:text-3xl font-bold text-navy">
                {stats.totalDocuments}
              </div>
              <div className="text-sm text-gray-500">Documents</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-navy">
                {stats.totalPages}
              </div>
              <div className="text-sm text-gray-500">Total Pages</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-navy">
                {stats.totalImages}
              </div>
              <div className="text-sm text-gray-500">Images Extracted</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-navy">
                {stats.totalFaces}
              </div>
              <div className="text-sm text-gray-500">Faces Identified</div>
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
                    {collection.count} documents
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
                Our pipeline runs OCR on scanned documents, extracts images,
                identifies faces, and builds a searchable index.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-navy rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">You Search & Explore</h3>
              <p className="text-sm text-gray-500">
                Full-text search across all documents. Find names, keywords,
                and browse photos with facial recognition.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Documents (placeholder) */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Recently Added Documents
            </h2>
            <Link
              href="/browse"
              className="text-accent hover:text-accent-hover font-medium text-sm"
            >
              View All &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card p-4">
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-gray-100 rounded w-1/2 mb-3"></div>
                <div className="h-20 bg-gray-100 rounded mb-2"></div>
                <div className="flex gap-2">
                  <span className="badge badge-other">Dataset 12</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-400 text-sm mt-4">
            Documents will appear here once processing is complete
          </p>
        </div>
      </section>

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
