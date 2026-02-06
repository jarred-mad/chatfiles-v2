// Deploy trigger: 2026-02-05-v2
// Build trigger: 2026-02-05-v1
import Link from "next/link";
import SearchBar from "@/components/ui/SearchBar";
import { query } from "@/lib/database";
import { AdBanner, InContentAd, HilltopAdBanner1, HilltopAdBanner2, HilltopAdBanner3 } from "@/components/ui/AdSlot";
import RecentlySearched from "@/components/ui/RecentlySearched";

// 100 Notable individuals from the DOJ Epstein Files
const allNotableNames = [
  "Donald Trump", "Bill Clinton", "Al Gore", "Bill Richardson", "George Mitchell",
  "Alexander Acosta", "Stacey Plaskett", "Peter Mandelson", "Keir Starmer", "Ehud Barak",
  "Narendra Modi", "Tony Blair", "John Kerry", "Andrew Cuomo", "Robert F. Kennedy Jr.",
  "Prince Andrew", "Sarah Ferguson", "Mette-Marit", "Elon Musk", "Bill Gates",
  "Jeff Bezos", "Sergey Brin", "Eric Schmidt", "Reid Hoffman", "Peter Thiel",
  "Mark Zuckerberg", "Larry Page", "Howard Lutnick", "Leslie Wexner", "Leon Black",
  "Steve Tisch", "Casey Wasserman", "Jes Staley", "Mortimer Zuckerman", "Tom Barrack",
  "Glenn Dubin", "Ronald Perelman", "Tom Pritzker", "Rupert Murdoch", "David Koch",
  "Lewis Ranieri", "Kevin Spacey", "Chris Tucker", "Woody Allen", "Mick Jagger",
  "Michael Jackson", "Diana Ross", "Jay-Z", "Harvey Weinstein", "Pusha T",
  "Brett Ratner", "Phil Collins", "Minnie Driver", "Naomi Campbell", "David Copperfield",
  "Walter Cronkite", "Lady Gaga", "Timothée Chalamet", "Alec Baldwin", "Katie Couric",
  "Peggy Siegal", "David Brooks", "Dr. Mehmet Oz", "Noam Chomsky", "Larry Summers",
  "Stephen Hawking", "Marvin Minsky", "Lawrence Krauss", "Stephen Kosslyn", "Joi Ito",
  "Boris Nikolic", "Alan Dershowitz", "Kenneth Starr", "Alex Spiro", "Kathryn Ruemmler",
  "Miroslav Lajčák", "Joanna Rubinstein", "Kevin Rudd", "Mohammed bin Salman", "Deepak Chopra",
  "Elie Wiesel", "Richard Branson", "Steve Bannon", "Mira Nair", "George Stephanopoulos",
  "Carole Radziwill", "Whitney Sudler-Smith", "Michael Bloomberg", "Eva Andersson-Dubin",
  "Jean-Luc Brunel", "Ghislaine Maxwell", "Caroline Stanbury", "Merrie Spaeth",
  "Larry Visoski", "Nadia Marcinkova", "Sarah Kellen", "Lesley Groff", "Peter Listerman",
  "Karyna Shuliak", "Mark Epstein",
];

// Shuffle array using seeded random based on current hour (changes hourly)
function shuffleWithSeed(array: string[], seed: number): string[] {
  const shuffled = [...array];
  let currentIndex = shuffled.length;
  let seededRandom = seed;

  while (currentIndex > 0) {
    seededRandom = (seededRandom * 9301 + 49297) % 233280;
    const randomIndex = Math.floor((seededRandom / 233280) * currentIndex);
    currentIndex--;
    [shuffled[currentIndex], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[currentIndex]];
  }

  return shuffled;
}

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
         LIMIT 20`
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

async function getRecentArticles() {
  try {
    const articles = await query<{
      slug: string;
      person_name: string;
      title: string;
      summary: string;
      category: string;
      image_url: string;
    }>(
      `SELECT slug, person_name, title, summary, category, image_url
       FROM articles
       WHERE published_at IS NOT NULL
       ORDER BY updated_at DESC
       LIMIT 8`
    );
    return articles;
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
  const recentArticles = await getRecentArticles();

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

          {/* Quick Search Chips */}
          <div className="flex flex-wrap justify-center gap-2">
            {["Flight Logs", "FBI Report", "Deposition", "Interview", "Email", "Court Filing"].map((term) => (
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

      {/* Processing Notice */}
      <section className="bg-gradient-to-r from-amber-500 to-orange-500 py-4">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center gap-3 text-white text-center">
            <svg className="w-6 h-6 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="font-medium">
              Bear with us as our software has millions of files to analyze. Our facial recognition software is analyzing all the photos so you can search for photos of people involved.
            </span>
          </div>
        </div>
      </section>

      {/* Names in the Files Section */}
      <section className="bg-navy-light py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              Names in the Files
            </h2>
            <Link href="/people" className="text-accent hover:text-accent-hover text-sm font-medium">
              View All 100 &rarr;
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {shuffleWithSeed(allNotableNames, Math.floor(Date.now() / 3600000)).slice(0, 30).map((name) => (
              <Link
                key={name}
                href={`/search?q=${encodeURIComponent(name)}`}
                className="px-3 py-2 bg-white/5 hover:bg-accent text-white text-sm rounded-lg transition-colors border border-white/10 hover:border-accent"
              >
                {name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recently Searched */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <RecentlySearched />
        </div>
      </section>

      {/* Ad Banner */}
      <AdBanner className="bg-gray-100 py-4" />

      {/* HilltopAds */}
      <div className="bg-gray-50 py-4">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap justify-center gap-4">
          <HilltopAdBanner1 />
          <HilltopAdBanner2 />
        </div>
      </div>

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

      {/* In-Content Ad */}
      <div className="bg-gray-50 py-4">
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center gap-4">
          <InContentAd />
          <HilltopAdBanner3 />
        </div>
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

      {/* Recent Articles */}
      {recentArticles.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Recent Articles
              </h2>
              <Link
                href="/articles"
                className="text-accent hover:text-accent-hover font-medium text-sm"
              >
                View All &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentArticles.map((article) => (
                <Link key={article.slug} href={`/articles/${article.slug}`} className="card card-hover overflow-hidden">
                  <div className="h-32 bg-gray-100 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={article.image_url || '/images/placeholder.jpg'}
                      alt={article.person_name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                      {article.category}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 text-sm line-clamp-2">{article.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{article.summary}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

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
