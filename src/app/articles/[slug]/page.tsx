import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { query } from '@/lib/database';
import { AdBanner, WideSkyscraperAd } from '@/components/ui/AdSlot';

interface DbArticle {
  id: number;
  slug: string;
  person_name: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  image_url: string;
  document_count: number;
  is_featured: boolean;
  published_at: string;
}

interface ArticleRow {
  id: number;
  slug: string;
  person_name: string;
  title: string;
  category: string;
  image_url: string;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getArticle(slug: string): Promise<DbArticle | null> {
  try {
    const result = await query<DbArticle>(
      `SELECT * FROM articles WHERE slug = $1 LIMIT 1`,
      [slug]
    );
    return result[0] || null;
  } catch (e) {
    console.error('Error fetching article:', e);
    return null;
  }
}

async function getAllArticles(): Promise<ArticleRow[]> {
  try {
    return await query<ArticleRow>(
      `SELECT id, slug, person_name, title, category, image_url
       FROM articles
       ORDER BY person_name ASC`
    );
  } catch (e) {
    console.error('Error fetching articles:', e);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return { title: 'Article Not Found' };
  }

  return {
    title: `${article.title} | ChatFiles.org`,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      images: [article.image_url],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.summary,
      images: [article.image_url],
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  const allArticles = await getAllArticles();

  const shareUrl = `https://chatfiles.org/articles/${slug}`;
  const shareText = `${article.title} - Read the full analysis at ChatFiles.org`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Ad Banner */}
      <AdBanner className="py-4 bg-gray-100" />

      {/* Main Layout with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Article Content - Left Side */}
          <article className="flex-1 min-w-0">
            {/* Hero Image */}
            <div className="relative h-72 md:h-96 bg-gray-900 rounded-t-xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.image_url}
                alt={article.person_name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="inline-block bg-white/20 backdrop-blur px-3 py-1 rounded text-white text-sm mb-2">
                  {article.category}
                </span>
              </div>
            </div>

            {/* Article Content */}
            <div className="bg-white shadow-lg rounded-b-xl">
              <div className="p-6 md:p-10">
                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {article.title}
                </h1>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                  <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                    {article.document_count.toLocaleString()} Documents Referenced
                  </span>
                  <span className="text-gray-500 text-sm">
                    ChatFiles.org
                  </span>
                </div>

                {/* Content - Rendered as Markdown */}
                <div className="prose prose-lg max-w-none">
                  {article.content.split('\n').map((paragraph, index) => {
                    const trimmed = paragraph.trim();
                    if (!trimmed) return null;

                    // Handle markdown headers
                    if (trimmed.startsWith('## ')) {
                      return (
                        <h2 key={index} className="text-2xl font-bold text-gray-900 mt-8 mb-4">
                          {trimmed.replace('## ', '')}
                        </h2>
                      );
                    }
                    if (trimmed.startsWith('### ')) {
                      return (
                        <h3 key={index} className="text-xl font-semibold text-gray-800 mt-6 mb-3">
                          {trimmed.replace('### ', '')}
                        </h3>
                      );
                    }
                    // Handle horizontal rules
                    if (trimmed === '---') {
                      return <hr key={index} className="my-8 border-gray-200" />;
                    }
                    // Handle blockquotes
                    if (trimmed.startsWith('> ')) {
                      return (
                        <blockquote key={index} className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">
                          {trimmed.replace('> ', '')}
                        </blockquote>
                      );
                    }
                    // Handle list items
                    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                      return (
                        <li key={index} className="ml-4 text-gray-700">
                          {trimmed.replace(/^[-*] /, '')}
                        </li>
                      );
                    }
                    if (/^\d+\. /.test(trimmed)) {
                      return (
                        <li key={index} className="ml-4 text-gray-700 list-decimal">
                          {trimmed.replace(/^\d+\. /, '')}
                        </li>
                      );
                    }
                    // Handle bold text
                    if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
                      return (
                        <p key={index} className="font-bold text-gray-900 my-2">
                          {trimmed.replace(/\*\*/g, '')}
                        </p>
                      );
                    }
                    // Regular paragraph
                    return (
                      <p key={index} className="text-gray-700 leading-relaxed mb-4">
                        {trimmed}
                      </p>
                    );
                  })}
                </div>

                {/* Search Link */}
                <div className="mt-10 pt-8 border-t border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Research {article.person_name} in the Documents
                  </h2>
                  <Link
                    href={`/search?q=${encodeURIComponent(article.person_name)}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-navy text-white rounded-lg hover:bg-navy-light transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search {article.document_count} Documents
                  </Link>
                </div>

                {/* Share Section */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Share This Article</h3>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:opacity-90"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      Post
                    </a>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:opacity-90"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Share
                    </a>
                    <a
                      href={`https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(article.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-[#FF4500] text-white rounded-lg hover:opacity-90"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                      </svg>
                      Reddit
                    </a>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Disclaimer:</strong> Appearance in these documents does not imply wrongdoing.
                    Many individuals appear as witnesses, victims, acquaintances, or in incidental references.
                    This article is provided for informational and research purposes only. All information
                    is sourced from publicly available DOJ documents.
                  </p>
                </div>
              </div>
            </div>
          </article>

          {/* Sidebar - Right Side */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="sticky top-20 space-y-6">
              {/* Ad */}
              <div className="hidden lg:block">
                <WideSkyscraperAd />
              </div>

              {/* All Articles List */}
              <div className="bg-white rounded-lg shadow-lg p-4">
                <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b">
                  All Articles ({allArticles.length})
                </h3>
                <div className="max-h-[600px] overflow-y-auto space-y-2">
                  {allArticles.map((art) => (
                    <Link
                      key={art.id}
                      href={`/articles/${art.slug}`}
                      className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                        art.slug === slug
                          ? 'bg-blue-50 border-l-4 border-blue-500'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={art.image_url}
                        alt={art.person_name}
                        className="w-10 h-10 rounded-full object-cover bg-gray-200 flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium truncate ${
                          art.slug === slug ? 'text-blue-700' : 'text-gray-900'
                        }`}>
                          {art.person_name}
                        </div>
                        <div className="text-xs text-gray-500">{art.category}</div>
                      </div>
                    </Link>
                  ))}

                  {allArticles.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No articles found
                    </p>
                  )}
                </div>

                {/* View All Link */}
                <div className="mt-4 pt-4 border-t">
                  <Link
                    href="/articles"
                    className="block text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View All Articles →
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
