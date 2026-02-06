'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface RecentSearch {
  id: number;
  name: string;
  resultCount: number;
  photoUrl: string | null;
  searchCount: number;
  lastSearchedAt: string;
}

export default function RecentlySearched() {
  const [searches, setSearches] = useState<RecentSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchRecentSearches = async () => {
      try {
        const res = await fetch('/api/recent-searches?limit=12');
        if (res.ok) {
          const data = await res.json();
          setSearches(data.searches || []);
        }
      } catch (error) {
        console.error('Failed to fetch recent searches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentSearches();
  }, []);

  const handleImageError = (id: number) => {
    setImageErrors(prev => new Set(prev).add(id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">Recently Searched</h2>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  if (searches.length === 0) {
    return null; // Don't show section if no recent searches
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">Recently Searched</h2>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            Live
          </span>
        </div>
        <Link href="/people" className="text-sm text-accent hover:text-accent-hover font-medium">
          View All People →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {searches.map((search) => (
          <Link
            key={search.id}
            href={`/search?q=${encodeURIComponent(search.name)}`}
            className="group"
          >
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
              {search.photoUrl && !imageErrors.has(search.id) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={search.photoUrl}
                  alt={search.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  onError={() => handleImageError(search.id)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-navy to-navy-light">
                  <span className="text-3xl font-bold text-white/80">
                    {search.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
              )}
              {/* Result count badge */}
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {search.resultCount.toLocaleString()} docs
              </div>
            </div>
            <h3 className="font-medium text-gray-900 text-sm truncate group-hover:text-accent transition-colors">
              {search.name}
            </h3>
            <p className="text-xs text-gray-500">
              {formatTimeAgo(search.lastSearchedAt)}
            </p>
          </Link>
        ))}
      </div>
    </>
  );
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
