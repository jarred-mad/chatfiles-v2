'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AdBanner } from '@/components/ui/AdSlot';

interface Video {
  id: string;
  filename: string;
  file_path: string | null;
  file_size_bytes: number;
  dataset_number: number;
  thumbnail_url?: string;
}

interface DatasetCount {
  number: number;
  count: number;
}

const R2_PUBLIC_URL = 'https://pub-e8b8792b476a4216b2cbd491f9d61af0.r2.dev';

function getThumbnailUrl(videoId: string): string {
  return `${R2_PUBLIC_URL}/thumbnails/${videoId}.jpg`;
}

interface VideoResponse {
  videos: Video[];
  total: number;
  page: number;
  totalPages: number;
  datasets?: DatasetCount[];
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`;
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [datasets, setDatasets] = useState<DatasetCount[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [jumpToPage, setJumpToPage] = useState('');

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/videos?page=${page}&limit=24`;
      if (selectedDataset !== null) {
        url += `&dataset=${selectedDataset}`;
      }
      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }
      const res = await fetch(url);
      const data: VideoResponse = await res.json();
      setVideos(data.videos || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
      if (data.datasets && data.datasets.length > 0) {
        setDatasets(data.datasets);
      }
    } catch (err) {
      console.error('Failed to fetch videos:', err);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }, [page, selectedDataset, searchQuery]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleDatasetFilter = (datasetNum: number | null) => {
    setSelectedDataset(datasetNum);
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchVideos();
  };

  const handleJumpToPage = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(jumpToPage, 10);
    if (pageNum >= 1 && pageNum <= totalPages) {
      setPage(pageNum);
      setJumpToPage('');
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Videos</h1>
          <p className="text-gray-300">
            {total.toLocaleString()} videos from the Epstein files
          </p>
        </div>
      </div>

      {/* Ad Banner */}
      <AdBanner className="py-4 bg-gray-100" />

      {/* Processing Notice */}
      <div className="bg-blue-50 border-b border-blue-200">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-sm text-blue-700">
              <strong>Processing in Progress:</strong> We are currently processing and uploading a large collection of videos from the Epstein files.
              Check back regularly as we slowly add more videos with thumbnails and previews.
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by filename..."
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Dataset Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500">Dataset:</span>
              <button
                onClick={() => handleDatasetFilter(null)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedDataset === null
                    ? 'bg-navy text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {datasets.filter(ds => ds.number !== 0).map((ds) => (
                <button
                  key={ds.number}
                  onClick={() => handleDatasetFilter(ds.number)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedDataset === ds.number
                      ? 'bg-navy text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  DS {ds.number}
                  <span className="ml-1 text-xs opacity-70">({ds.count})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
                <div className="aspect-video bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Videos Yet</h3>
            <p className="text-gray-500">Videos are currently being processed and uploaded. Check back soon!</p>
          </div>
        ) : (
          <>
            {/* Video Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <Link
                  key={video.id}
                  href={`/videos/${video.id}`}
                  className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-gray-900 relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getThumbnailUrl(video.id)}
                      alt={video.filename}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Hide broken image and show placeholder
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    {/* Fallback icon (shown when image fails) */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    {/* Play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 truncate">{video.filename}</h3>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                      <span>Dataset {video.dataset_number}</span>
                      {video.file_size_bytes > 0 && (
                        <>
                          <span>•</span>
                          <span>{formatFileSize(video.file_size_bytes)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-4 mt-8">
                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    className="px-3 py-2 bg-white border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
                    title="First page"
                  >
                    &laquo;
                  </button>
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-2 bg-white border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
                  >
                    Prev
                  </button>

                  {getPageNumbers().map((p, idx) => (
                    typeof p === 'number' ? (
                      <button
                        key={idx}
                        onClick={() => setPage(p)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          page === p
                            ? 'bg-navy text-white'
                            : 'bg-white border hover:bg-gray-50'
                        }`}
                      >
                        {p}
                      </button>
                    ) : (
                      <span key={idx} className="px-2 text-gray-400">...</span>
                    )
                  ))}

                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-2 bg-white border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                    className="px-3 py-2 bg-white border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
                    title="Last page"
                  >
                    &raquo;
                  </button>
                </div>

                {/* Jump to Page */}
                <form onSubmit={handleJumpToPage} className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Go to page:</span>
                  <input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={jumpToPage}
                    onChange={(e) => setJumpToPage(e.target.value)}
                    placeholder={String(page)}
                    className="w-16 px-2 py-1 border rounded text-center text-sm"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1 bg-navy text-white rounded text-sm hover:bg-navy-light"
                  >
                    Go
                  </button>
                  <span className="text-sm text-gray-400">of {totalPages}</span>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
