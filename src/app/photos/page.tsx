'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AdSlot from '@/components/ui/AdSlot';

// Mock data
const mockPhotos = Array.from({ length: 24 }, (_, i) => ({
  id: `photo_${i + 1}`,
  document_id: `doc_${Math.floor(i / 3) + 1}`,
  document_name: `Document_${Math.floor(i / 3) + 1}.pdf`,
  page_number: (i % 5) + 1,
  width: 300 + Math.floor(Math.random() * 200),
  height: 200 + Math.floor(Math.random() * 300),
  has_faces: i % 4 === 0,
  dataset_number: 8 + (i % 5),
}));

const mockClusters = [
  { id: 'cluster_1', label: 'Jeffrey Epstein', face_count: 45, is_known: true },
  { id: 'cluster_2', label: 'Ghislaine Maxwell', face_count: 32, is_known: true },
  { id: 'cluster_3', label: 'Prince Andrew', face_count: 12, is_known: true },
  { id: 'cluster_4', label: null, face_count: 28, is_known: false },
  { id: 'cluster_5', label: null, face_count: 18, is_known: false },
  { id: 'cluster_6', label: null, face_count: 15, is_known: false },
];

function PhotosContent() {
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<'all' | 'by-person'>(
    searchParams.get('view') === 'by-person' ? 'by-person' : 'all'
  );
  const [selectedDataset, setSelectedDataset] = useState<number | null>(null);

  const filteredPhotos = selectedDataset
    ? mockPhotos.filter((p) => p.dataset_number === selectedDataset)
    : mockPhotos;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900">Photo Gallery</h1>
          <p className="text-gray-500 mt-1">
            Browse {mockPhotos.length.toLocaleString()} extracted images from the document archive
          </p>

          {/* View Toggle */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => setViewMode('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'all'
                  ? 'bg-navy text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Photos
            </button>
            <button
              onClick={() => setViewMode('by-person')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'by-person'
                  ? 'bg-navy text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              By Person
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {viewMode === 'all' ? (
          <>
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

            {/* Photo Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredPhotos.map((photo, index) => (
                <div key={photo.id}>
                  <Link
                    href={`/photos/${photo.id}`}
                    className="block bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div
                      className="bg-gray-200 relative"
                      style={{ paddingBottom: `${(photo.height / photo.width) * 100}%` }}
                    >
                      {photo.has_faces && (
                        <span className="absolute top-2 right-2 bg-accent text-white text-xs px-2 py-0.5 rounded">
                          Face detected
                        </span>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        <svg
                          className="w-12 h-12"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-sm text-gray-900 truncate">{photo.document_name}</p>
                      <p className="text-xs text-gray-500">Page {photo.page_number}</p>
                    </div>
                  </Link>

                  {/* Ad every 8 photos on mobile */}
                  {(index + 1) % 8 === 0 && (
                    <div className="col-span-2 md:col-span-3 lg:col-span-4 my-4 flex justify-center">
                      <AdSlot size="incontent" id={`photos-inline-${index}`} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Load More */}
            <div className="mt-8 text-center">
              <button className="px-6 py-2 bg-navy text-white rounded-md hover:bg-navy-light transition-colors">
                Load More Photos
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Person Clusters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockClusters.map((cluster) => (
                <Link
                  key={cluster.id}
                  href={`/photos/person/${cluster.id}`}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center p-4 gap-4">
                    {/* Face preview */}
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900">
                        {cluster.label || `Unknown Person #${cluster.id.split('_')[1]}`}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {cluster.face_count} photos
                      </p>
                      {cluster.is_known && (
                        <span className="inline-block mt-1 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                          Identified
                        </span>
                      )}
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PhotosPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy"></div>
      </div>
    }>
      <PhotosContent />
    </Suspense>
  );
}
