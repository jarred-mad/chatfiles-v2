'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AdSlot, { AdBanner } from '@/components/ui/AdSlot';

interface Photo {
  id: string;
  document_id: string;
  document_name: string;
  page_number: number;
  image_path: string | null;
  width: number;
  height: number;
  has_faces: boolean;
  dataset_number: number;
  face_count: number;
}

interface Cluster {
  id: string;
  label: string | null;
  sample_image_path: string | null;
  face_count: number;
  is_known: boolean;
}

interface Dataset {
  number: number;
  count: number;
}

function PhotosContent() {
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<'all' | 'by-person'>(
    searchParams.get('view') === 'by-person' ? 'by-person' : 'all'
  );
  const [selectedDataset, setSelectedDataset] = useState<number | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Fetch photos
  useEffect(() => {
    if (viewMode !== 'all') return;

    const fetchPhotos = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', page.toString());
        params.set('limit', '24');
        if (selectedDataset) params.set('dataset', selectedDataset.toString());

        const res = await fetch(`/api/photos?${params}`);
        const data = await res.json();

        if (data.results) {
          setPhotos(data.results);
          setTotal(data.total);
          if (data.datasets) setDatasets(data.datasets);
        }
      } catch (error) {
        console.error('Failed to fetch photos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [viewMode, selectedDataset, page]);

  // Fetch clusters for "by person" view
  useEffect(() => {
    if (viewMode !== 'by-person') return;

    const fetchClusters = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/photos/clusters');
        const data = await res.json();

        if (data.clusters) {
          setClusters(data.clusters);
        }
      } catch (error) {
        console.error('Failed to fetch clusters:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClusters();
  }, [viewMode]);

  const handleLoadMore = () => {
    setPage((p) => p + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Ad Banner */}
      <AdBanner id="photos-top" className="bg-white border-b" />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900">Photo Gallery</h1>
          <p className="text-gray-500 mt-1">
            Browse {total.toLocaleString()} extracted images from the document archive
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
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy"></div>
          </div>
        ) : viewMode === 'all' ? (
          <>
            {/* Dataset Filter */}
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

            {/* Photo Grid */}
            {photos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo, index) => (
                  <div key={photo.id}>
                    <Link
                      href={`/documents/${photo.document_id}`}
                      className="block bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div
                        className="bg-gray-200 relative"
                        style={{ paddingBottom: `${(photo.height / photo.width) * 100}%` }}
                      >
                        {photo.image_path ? (
                          <img
                            src={photo.image_path}
                            alt={`Image from ${photo.document_name}`}
                            className="absolute inset-0 w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
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
                        )}
                        {photo.has_faces && (
                          <span className="absolute top-2 right-2 bg-accent text-white text-xs px-2 py-0.5 rounded">
                            {photo.face_count} face{photo.face_count !== 1 ? 's' : ''}
                          </span>
                        )}
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
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-gray-500">No images found. Image extraction is still in progress.</p>
              </div>
            )}

            {/* Load More */}
            {photos.length > 0 && photos.length < total && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleLoadMore}
                  className="px-6 py-2 bg-navy text-white rounded-md hover:bg-navy-light transition-colors"
                >
                  Load More Photos
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Person Clusters */}
            {clusters.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clusters.map((cluster) => (
                  <Link
                    key={cluster.id}
                    href={`/photos/person/${cluster.id}`}
                    className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center p-4 gap-4">
                      {/* Face preview */}
                      <div className="w-20 h-20 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {cluster.sample_image_path ? (
                          <img
                            src={cluster.sample_image_path}
                            alt={cluster.label || 'Unknown person'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
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
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">
                          {cluster.label || `Unknown Person #${cluster.id}`}
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <p className="text-gray-500">No face clusters found. Face detection is still in progress.</p>
              </div>
            )}
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
