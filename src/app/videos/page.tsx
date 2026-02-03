'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdSlot, { AdBanner } from '@/components/ui/AdSlot';

interface Video {
  id: string;
  filename: string;
  file_path: string | null;
  file_size_bytes: number;
  dataset_number: number;
  created_at: string;
}

interface Dataset {
  number: number;
  count: number;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export default function VideosPage() {
  const [selectedDataset, setSelectedDataset] = useState<number | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', page.toString());
        params.set('limit', '24');
        if (selectedDataset) params.set('dataset', selectedDataset.toString());

        const res = await fetch(`/api/videos?${params}`);
        const data = await res.json();

        if (data.videos) {
          setVideos(data.videos);
          setTotal(data.total);
          if (data.datasets) setDatasets(data.datasets);
        }
      } catch (error) {
        console.error('Failed to fetch videos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [selectedDataset, page]);

  const handleLoadMore = () => {
    setPage((p) => p + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Ad Banner */}
      <AdBanner id="videos-top" className="bg-white border-b" />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900">Video Archive</h1>
          <p className="text-gray-500 mt-1">
            Browse {total.toLocaleString()} video files from the document archive
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy"></div>
          </div>
        ) : (
          <>
            {/* Dataset Filter */}
            {datasets.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setSelectedDataset(null);
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedDataset === null
                      ? 'bg-navy text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Datasets
                </button>
                {datasets.map((ds) => (
                  <button
                    key={ds.number}
                    onClick={() => {
                      setSelectedDataset(ds.number);
                      setPage(1);
                    }}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedDataset === ds.number
                        ? 'bg-navy text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Dataset {ds.number} ({ds.count.toLocaleString()})
                  </button>
                ))}
              </div>
            )}

            {/* Video Grid */}
            {videos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos.map((video, index) => (
                  <div key={video.id}>
                    <Link
                      href={`/documents/${video.id}`}
                      className="block bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
                    >
                      {/* Thumbnail */}
                      <div className="relative aspect-video bg-gray-900">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg
                            className="w-16 h-16 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        {/* Play button overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                            <svg
                              className="w-8 h-8 text-navy ml-1"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 truncate group-hover:text-accent">
                          {video.filename}
                        </h3>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span>Dataset {video.dataset_number}</span>
                          <span>{formatFileSize(video.file_size_bytes)}</span>
                        </div>
                      </div>
                    </Link>

                    {/* Ad every 8 videos */}
                    {(index + 1) % 8 === 0 && (
                      <div className="col-span-full my-4 flex justify-center">
                        <AdSlot size="incontent" id={`videos-inline-${index}`} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
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
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-gray-500">No videos found in the archive</p>
              </div>
            )}

            {/* Load More */}
            {videos.length > 0 && videos.length < total && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleLoadMore}
                  className="px-6 py-2 bg-navy text-white rounded-md hover:bg-navy-light transition-colors"
                >
                  Load More Videos
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
