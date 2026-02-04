'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { AdBanner } from '@/components/ui/AdSlot';

const ARTICLES = [
  {
    slug: 'bill-clinton-flight-logs',
    name: 'Bill Clinton',
    title: 'Bill Clinton in the Epstein Files: Flight Logs and Document References',
    description: 'An examination of former President Bill Clinton\'s appearances in the DOJ Epstein files.',
    image: '/images/articles/Bill_Clinton.jpg',
    category: 'Politicians',
  },
  {
    slug: 'prince-andrew-settlement',
    name: 'Prince Andrew',
    title: 'Prince Andrew and the Epstein Connection',
    description: 'A detailed look at Prince Andrew\'s appearances in the DOJ Epstein files.',
    image: '/images/articles/Prince_Andrew.jpg',
    category: 'Royalty',
  },
  {
    slug: 'bill-gates-meetings',
    name: 'Bill Gates',
    title: 'Bill Gates and Jeffrey Epstein: Documented Meetings',
    description: 'Examining the documented meetings between Microsoft founder Bill Gates and Jeffrey Epstein.',
    image: '/images/articles/Bill_Gates.jpg',
    category: 'Tech',
  },
  {
    slug: 'donald-trump-relationship',
    name: 'Donald Trump',
    title: 'Donald Trump in the Epstein Files',
    description: 'An analysis of former President Donald Trump\'s appearances in the DOJ Epstein files.',
    image: '/images/articles/Donald_Trump.jpg',
    category: 'Politicians',
  },
  {
    slug: 'ghislaine-maxwell-role',
    name: 'Ghislaine Maxwell',
    title: 'Ghislaine Maxwell: The Key Figure',
    description: 'Understanding Ghislaine Maxwell\'s central role in the Epstein case.',
    image: '/images/articles/Ghislaine_Maxwell.jpg',
    category: 'Inner Circle',
  },
  {
    slug: 'alan-dershowitz-defense',
    name: 'Alan Dershowitz',
    title: 'Alan Dershowitz: Defense Attorney and Allegations',
    description: 'How renowned attorney Alan Dershowitz appears in the Epstein files.',
    image: '/images/articles/Alan_Dershowitz.jpg',
    category: 'Legal',
  },
  {
    slug: 'les-wexner-connection',
    name: 'Les Wexner',
    title: 'Les Wexner: The Billionaire Behind Epstein\'s Fortune',
    description: 'How retail magnate Les Wexner became Epstein\'s biggest benefactor.',
    image: '/images/articles/Les_Wexner.jpg',
    category: 'Business',
  },
  {
    slug: 'flight-logs-analysis',
    name: 'Flight Logs',
    title: 'The Epstein Flight Logs: Complete Analysis',
    description: 'Deep dive into the flight records of Epstein\'s private aircraft.',
    image: '/images/articles/Flight_Logs.jpg',
    category: 'Evidence',
  },
  {
    slug: 'black-book-contacts',
    name: 'Black Book',
    title: 'Epstein\'s Black Book: The Contact List',
    description: 'Inside the infamous address book containing the world\'s most powerful people.',
    image: '/images/articles/Black_Book.jpg',
    category: 'Evidence',
  },
  {
    slug: 'jean-luc-brunel-modeling',
    name: 'Jean-Luc Brunel',
    title: 'Jean-Luc Brunel: The Modeling Agent',
    description: 'The dark story of French modeling agent Jean-Luc Brunel.',
    image: '/images/articles/Jean_Luc_Brunel.jpg',
    category: 'Inner Circle',
  },
  {
    slug: 'private-islands-caribbean',
    name: 'Private Islands',
    title: 'Epstein\'s Private Islands: Little St. James',
    description: 'Inside the Caribbean properties where Epstein allegedly conducted crimes.',
    image: '/images/articles/Little_St_James.jpg',
    category: 'Locations',
  },
  {
    slug: 'epstein-prison-death',
    name: 'Epstein Death',
    title: 'The Death of Jeffrey Epstein: Questions Remain',
    description: 'Examining the circumstances surrounding Epstein\'s death in federal custody.',
    image: '/images/articles/MCC_New_York.jpg',
    category: 'Investigation',
  },
];

export default function ArticlesPage() {
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Randomize featured article on each visit
    const randomIndex = Math.floor(Math.random() * ARTICLES.length);
    setFeaturedIndex(randomIndex);
    setIsLoaded(true);
  }, []);

  // Get featured article and remaining articles
  const featuredArticle = ARTICLES[featuredIndex];
  const otherArticles = ARTICLES.filter((_, index) => index !== featuredIndex);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-3">Epstein Files Articles</h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            In-depth analysis of notable individuals mentioned in the DOJ Epstein files.
            All articles are AI-generated based on publicly available documents.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-purple-600/30 text-purple-200 px-4 py-2 rounded-full text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            AI-Generated Content
          </div>
        </div>
      </div>

      {/* Ad Banner */}
      <AdBanner className="py-4 bg-gray-100" />

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Featured Article - Now Randomized */}
        <div className="mb-10">
          <Link
            href={`/articles/${featuredArticle.slug}`}
            className="block bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
            <div className="md:flex">
              <div className="md:w-1/2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={featuredArticle.image}
                  alt={featuredArticle.name}
                  className="w-full h-64 md:h-full object-cover"
                />
              </div>
              <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                <span className="text-accent text-sm font-medium mb-2">Featured Article</span>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  {featuredArticle.title}
                </h2>
                <p className="text-gray-600 mb-4">{featuredArticle.description}</p>
                <span className="text-accent font-medium">Read Article →</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Article Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherArticles.map((article) => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.image}
                  alt={article.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded">
                  {article.category}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{article.title}</h3>
                <p className="text-gray-600 text-sm line-clamp-2">{article.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-accent text-sm font-medium">Read →</span>
                  <span className="text-xs text-purple-600 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    AI
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

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
                href="/browse"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Browse by Dataset
              </Link>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          <strong>Disclaimer:</strong> All articles on this page are AI-generated summaries based on publicly
          available DOJ documents. Appearance in these documents does not imply wrongdoing. Many individuals
          appear as witnesses, victims, or in incidental references. Content is provided for informational
          and research purposes only.
        </div>
      </div>
    </div>
  );
}
