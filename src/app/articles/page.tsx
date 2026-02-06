'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

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

interface ArticlesResponse {
  articles: Article[];
  total: number;
  page: number;
  totalPages: number;
  categories: { name: string; count: number }[];
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const url = selectedCategory
        ? `/api/articles?category=${encodeURIComponent(selectedCategory)}`
        : '/api/articles';
      const res = await fetch(url);
      const data: ArticlesResponse = await res.json();
      setArticles(data.articles || []);
      setCategories(data.categories || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch articles:', err);
    } finally {
      setLoading(false);
    }
  };

  // Shuffle articles based on visit count for returning users
  const shuffleWithSeed = (arr: Article[], seed: number) => {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor((Math.abs(Math.sin(seed + i) * 10000)) % (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Get visit count from localStorage and shuffle articles
  const [displayArticles, setDisplayArticles] = useState<Article[]>([]);

  useEffect(() => {
    if (articles.length === 0) return;

    // Get and increment visit count
    const visitCount = parseInt(localStorage.getItem('articles_visit_count') || '0', 10);
    localStorage.setItem('articles_visit_count', String(visitCount + 1));

    // Shuffle based on visit count (different order each visit)
    const shuffled = shuffleWithSeed(articles, visitCount);
    setDisplayArticles(shuffled);
  }, [articles]);

  // Use shuffled articles if available, otherwise use original order
  const articlesToShow = displayArticles.length > 0 ? displayArticles : articles;

  // Get featured article (first one marked as featured, or first from shuffled list)
  const featuredArticle = articlesToShow.find(a => a.is_featured) || articlesToShow[0];
  const otherArticles = articlesToShow.filter(a => a.id !== featuredArticle?.id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-3">Epstein Files Articles</h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            In-depth analysis of {total} notable individuals mentioned in the DOJ Epstein files.
            All articles are generated based on publicly available documents.
          </p>
        </div>
      </div>

      {/* Ad Banner */}

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  !selectedCategory
                    ? 'bg-navy text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border'
                }`}
              >
                All ({total})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === cat.name
                      ? 'bg-navy text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border'
                  }`}
                >
                  {cat.name} ({cat.count})
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-5">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Articles Yet</h3>
            <p className="text-gray-500">Articles are being generated. Check back soon!</p>
          </div>
        ) : (
          <>
            {/* Featured Article */}
            {featuredArticle && (
              <div className="mb-10">
                <Link
                  href={`/articles/${featuredArticle.slug}`}
                  className="block bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="md:flex">
                    <div className="md:w-1/2 bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={featuredArticle.image_url}
                        alt={featuredArticle.person_name}
                        className="w-full h-64 md:h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                        }}
                      />
                    </div>
                    <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-accent text-sm font-medium">Featured</span>
                        <span className="text-gray-400">|</span>
                        <span className="text-gray-500 text-sm">{featuredArticle.category}</span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                        {featuredArticle.title}
                      </h2>
                      <p className="text-gray-600 mb-4 line-clamp-3">{featuredArticle.summary}</p>
                      <div className="flex items-center gap-4">
                        <span className="text-accent font-medium">Read Article →</span>
                        <span className="text-sm text-gray-500">
                          {featuredArticle.document_count} documents referenced
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Article Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/articles/${article.slug}`}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48 bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={article.image_url}
                      alt={article.person_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                      }}
                    />
                    <span className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded">
                      {article.category}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{article.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{article.summary}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-accent text-sm font-medium">Read →</span>
                      <span className="text-xs text-gray-500">
                        {article.document_count} docs
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* CTA */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Explore the Full Archive</h2>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              These articles are generated from over 460,000 documents in the DOJ Epstein files.
              Search the complete database to conduct your own research.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/search"
                className="px-6 py-3 bg-navy text-white rounded-lg font-medium hover:bg-navy-light transition-colors"
              >
                Search Documents
              </Link>
              <Link
                href="/people"
                className="px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent-hover transition-colors"
              >
                100 Notable Names
              </Link>
              <Link
                href="/creators"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Content Creator Tool
              </Link>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          <strong>Disclaimer:</strong> All articles on this page are generated summaries based on publicly
          available DOJ documents. Appearance in these documents does not imply wrongdoing. Many individuals
          appear as witnesses, victims, or in incidental references. Content is provided for informational
          and research purposes only.
        </div>
      </div>
    </div>
  );
}
