'use client';

import { useState } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/ui/AdSlot';

// Mock video data
const mockVideos = Array.from({ length: 24 }, (_, i) => ({
  id: `video_${i + 1}`,
  filename: `surveillance_footage_${i + 1}.mp4`,
  thumbnail_path: `/thumbnails/video_${i + 1}.jpg`,
  duration: 30 + Math.floor(Math.random() * 300), // 30 seconds to 5 minutes
  file_size_bytes: 5000000 + Math.floor(Math.random() * 50000000),
  dataset_number: 8 + (i % 5),
  description: i % 3 === 0
    ? 'Security camera footage from Palm Beach residence'
    : i % 3 === 1
    ? 'Surveillance recording from New York property'
    : 'Documentary footage from legal proceedings',
  created_at: '2019-03-15T10:30:00Z',
}));

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function VideosPage() {
  const [selectedDataset, setSelectedDataset] = useState<number | null>(null);

  const filteredVideos = selectedDataset
    ? mockVideos.filter((v) => v.dataset_number === selectedDataset)
    : mockVideos;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900">Video Archive</h1>
          <p className="text-gray-500 mt-1">
            Browse {mockVideos.length} video files from the document archive
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Dataset Filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedDataset(null)}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedDataset === null
                ? 'bg-navy text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Datasets
          </button>
          {[8, 9, 10, 11, 12].map((ds) => (
            <button
              key={ds}
              onClick={() => setSelectedDataset(ds)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedDataset === ds
                  ? 'bg-navy text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Dataset {ds}
            </button>
          ))}
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVideos.map((video, index) => (
            <div key={video.id}>
              <Link
                href={`/videos/${video.id}`}
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
                  {/* Duration badge */}
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-0.5 rounded">
                    {formatDuration(video.duration)}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 truncate group-hover:text-accent">
                    {video.filename}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {video.description}
                  </p>
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

        {filteredVideos.length === 0 && (
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
            <p className="text-gray-500">No videos found in this dataset</p>
          </div>
        )}
      </div>
    </div>
  );
}
