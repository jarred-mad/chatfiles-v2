'use client';
// Build: 2026-02-05-v2

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
  scene_type?: string;
  document_type?: string;
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

// Photo type categories with icons - quick filter buttons
const PHOTO_TYPE_BUTTONS = [
  { id: 'all', label: 'All Photos', icon: '📷' },
  { id: 'people', label: 'People', icon: '👥' },
];

function PhotosContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read state from URL
  const urlType = searchParams.get('type') || 'all';
  const urlPage = parseInt(searchParams.get('page') || '1', 10);
  const urlView = searchParams.get('view') || 'gallery';

  const [selectedType, setSelectedType] = useState(urlType);
  const [viewMode, setViewMode] = useState<'gallery' | 'by-person'>(
    urlView === 'by-person' ? 'by-person' : 'gallery'
  );
  const [selectedDataset, setSelectedDataset] = useState<number | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(urlPage);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync state with URL changes
  useEffect(() => {
    setPage(urlPage);
    setSelectedType(urlType);
  }, [urlPage, urlType]);

  // Update URL when filters change
  const updateUrl = (newType: string, newPage: number) => {
    const params = new URLSearchParams();
    if (newType !== 'all') params.set('type', newType);
    if (newPage > 1) params.set('page', String(newPage));
    if (viewMode === 'by-person') params.set('view', 'by-person');
    const queryString = params.toString();
    router.push(`/photos${queryString ? `?${queryString}` : ''}`, { scroll: false });
  };

  // Handle type selection
  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
    setPage(1);
    updateUrl(typeId, 1);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrl(selectedType, newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fetch photos
  useEffect(() => {
    if (viewMode === 'by-person') return;

    const fetchPhotos = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', page.toString());
        params.set('limit', '24');
        if (selectedDataset) params.set('dataset', selectedDataset.toString());
        if (selectedType !== 'all') params.set('scene', selectedType);
        if (searchQuery) params.set('q', searchQuery);

        const res = await fetch(`/api/photos?${params}`);
        const data = await res.json();

        if (data.results) {
          setPhotos(data.results);
          setTotal(data.total || 0);
          setTotalPages(Math.ceil((data.total || 0) / 24));
          if (data.datasets) setDatasets(data.datasets);
        }
      } catch (error) {
        console.error('Failed to fetch photos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [viewMode, selectedDataset, selectedType, page, searchQuery]);

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

  // Generate pagination numbers
  const getPaginationNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      if (page > 4) pages.push('...');

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (page < totalPages - 3) pages.push('...');

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Ad Banner */}
      <AdBanner id="photos-top" className="bg-white border-b" />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Photo Gallery</h1>
              <p className="text-gray-500 mt-1">
                {total.toLocaleString()} images from the document archive
              </p>
            </div>

            {/* Search Box */}
            <div className="w-full md:w-72">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search photos..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-navy"
                />
                <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => {
                setViewMode('gallery');
                setPage(1);
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'gallery'
                  ? 'bg-navy text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Gallery View
            </button>
            <button
              onClick={() => {
                setViewMode('by-person');
                setPage(1);
              }}
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

      {/* Photo Type Filter Buttons */}
      {viewMode === 'gallery' && (
        <div className="bg-gray-100 border-b border-gray-200 py-4">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-wrap gap-2">
              {PHOTO_TYPE_BUTTONS.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleTypeSelect(type.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedType === type.id
                      ? 'bg-navy text-white shadow-md scale-105'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-navy hover:text-navy'
                  }`}
                >
                  <span>{type.icon}</span>
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy"></div>
          </div>
        ) : viewMode === 'gallery' ? (
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

            {/* Current Filter Indicator */}
            {selectedType !== 'all' && (
              <div className="mb-4 flex items-center gap-2">
                <span className="text-gray-500">Showing:</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-navy/10 text-navy rounded-full text-sm font-medium">
                  {PHOTO_TYPE_BUTTONS.find(t => t.id === selectedType)?.icon}
                  {PHOTO_TYPE_BUTTONS.find(t => t.id === selectedType)?.label}
                  <button
                    onClick={() => handleTypeSelect('all')}
                    className="ml-1 hover:text-red-600"
                  >
                    x
                  </button>
                </span>
              </div>
            )}

            {/* Photo Grid */}
            {photos.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photos.map((photo, index) => (
                    <div key={photo.id}>
                      <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow group relative">
                        <Link href={`/documents/${photo.document_id}`}>
                          <div
                            className="bg-gray-200 relative"
                            style={{ paddingBottom: `${Math.min((photo.height / photo.width) * 100, 150)}%` }}
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
                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </Link>
                        {/* Share buttons */}
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a
                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out this photo from the Epstein Files')}&url=${encodeURIComponent(`https://chatfiles.org/documents/${photo.document_id}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-black text-white rounded-full hover:bg-gray-800"
                            onClick={(e) => e.stopPropagation()}
                            title="Share on X"
                          >
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                          </a>
                          <a
                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://chatfiles.org/documents/${photo.document_id}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-[#1877F2] text-white rounded-full hover:bg-[#166FE5]"
                            onClick={(e) => e.stopPropagation()}
                            title="Share on Facebook"
                          >
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                          </a>
                          <a
                            href={`https://www.reddit.com/submit?url=${encodeURIComponent(`https://chatfiles.org/documents/${photo.document_id}`)}&title=${encodeURIComponent('Photo from Epstein Files')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-[#FF4500] text-white rounded-full hover:bg-[#E03D00]"
                            onClick={(e) => e.stopPropagation()}
                            title="Share on Reddit"
                          >
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701z"/>
                            </svg>
                          </a>
                        </div>
                        <div className="p-3">
                          <p className="text-sm text-gray-900 truncate">{photo.document_name}</p>
                          <p className="text-xs text-gray-500">Page {photo.page_number}</p>
                        </div>
                      </div>

                      {(index + 1) % 8 === 0 && (
                        <div className="col-span-2 md:col-span-3 lg:col-span-4 my-4 flex justify-center">
                          <AdSlot size="incontent" id={`photos-inline-${index}`} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col items-center gap-4 pt-8">
                    <div className="flex items-center gap-1 flex-wrap justify-center">
                      {getPaginationNumbers().map((pageNum, idx) => (
                        pageNum === '...' ? (
                          <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">...</span>
                        ) : (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum as number)}
                            className={`px-3 py-2 rounded-md text-sm font-medium ${
                              page === pageNum
                                ? 'bg-navy text-white'
                                : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        &larr; Previous
                      </button>
                      <span className="text-sm text-gray-500">
                        Page {page} of {totalPages}
                      </span>
                      <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                        className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Next &rarr;
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500">
                  {selectedType !== 'all'
                    ? `No ${PHOTO_TYPE_BUTTONS.find(t => t.id === selectedType)?.label.toLowerCase()} photos found.`
                    : 'No images found. Image extraction is still in progress.'}
                </p>
                {selectedType !== 'all' && (
                  <button
                    onClick={() => handleTypeSelect('all')}
                    className="mt-4 text-navy hover:text-navy-light font-medium"
                  >
                    View all photos
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          /* By Person View */
          <>
            {clusters.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clusters.map((cluster) => (
                  <Link
                    key={cluster.id}
                    href={`/photos/person/${cluster.id}`}
                    className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center p-4 gap-4">
                      <div className="w-20 h-20 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {cluster.sample_image_path ? (
                          <img
                            src={cluster.sample_image_path}
                            alt={cluster.label || 'Unknown person'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
