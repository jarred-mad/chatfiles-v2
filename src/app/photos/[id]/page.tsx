import Link from 'next/link';
import { notFound } from 'next/navigation';
import { query } from '@/lib/database';

const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-e8b8792b476a4216b2cbd491f9d61af0.r2.dev';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface ImageRow {
  id: string;
  document_id: string;
  page_number: number | null;
  width: number | null;
  height: number | null;
  has_faces: boolean;
  file_path_r2: string | null;
  scene_type: string | null;
  document_type_class: string | null;
}

interface DocumentRow {
  id: string;
  filename: string;
  dataset_number: number;
}

async function getImage(id: string) {
  try {
    const images = await query<ImageRow>(
      `SELECT id, document_id, page_number, width, height, has_faces, file_path_r2, scene_type, document_type_class
       FROM extracted_images WHERE id = $1`,
      [id]
    );

    if (images.length === 0) {
      return null;
    }

    const image = images[0];

    // Get document info
    const docs = await query<DocumentRow>(
      'SELECT id, filename, dataset_number FROM documents WHERE id = $1',
      [image.document_id]
    );
    const document = docs[0] || null;

    // Get prev/next images (in same document)
    const prevImage = await query<{ id: string }>(
      `SELECT id FROM extracted_images
       WHERE document_id = $1 AND id < $2
       ORDER BY id DESC LIMIT 1`,
      [image.document_id, id]
    );

    const nextImage = await query<{ id: string }>(
      `SELECT id FROM extracted_images
       WHERE document_id = $1 AND id > $2
       ORDER BY id ASC LIMIT 1`,
      [image.document_id, id]
    );

    return {
      ...image,
      document,
      prev_id: prevImage[0]?.id || null,
      next_id: nextImage[0]?.id || null,
    };
  } catch (error) {
    console.error('Database error:', error);
    return null;
  }
}

export default async function PhotoDetailPage({ params }: PageProps) {
  const { id } = await params;
  const image = await getImage(id);

  if (!image) {
    notFound();
  }

  const imageUrl = image.file_path_r2?.startsWith('http')
    ? image.file_path_r2
    : `${R2_PUBLIC_URL}/${image.file_path_r2}`;

  const shareUrl = `https://chatfiles.org/photos/${id}`;
  const shareText = `Photo from DOJ Epstein Files - Document ${image.document?.filename || id}`;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation Bar */}
      <div className="bg-gray-800 border-b border-gray-700 py-3">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {image.prev_id ? (
              <Link
                href={`/photos/${image.prev_id}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-700 rounded-md hover:bg-gray-600 text-sm font-medium text-white"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-800 rounded-md text-sm text-gray-500 cursor-not-allowed">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </span>
            )}
            {image.next_id ? (
              <Link
                href={`/photos/${image.next_id}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-700 rounded-md hover:bg-gray-600 text-sm font-medium text-white"
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-800 rounded-md text-sm text-gray-500 cursor-not-allowed">
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {image.document && (
              <Link
                href={`/documents/${image.document.id}`}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                View Source Document
              </Link>
            )}
            <Link
              href="/photos"
              className="text-sm text-gray-400 hover:text-white"
            >
              Back to Gallery
            </Link>
          </div>
        </div>
      </div>

      {/* Main Image */}
      <div className="flex items-center justify-center p-4" style={{ minHeight: 'calc(100vh - 200px)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={`Photo from ${image.document?.filename || 'DOJ Epstein Files'}`}
          className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
        />
      </div>

      {/* Info Bar */}
      <div className="bg-gray-800 border-t border-gray-700 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
              {image.document && (
                <>
                  <span>
                    <strong>Document:</strong> {image.document.filename}
                  </span>
                  <span className="text-gray-600">|</span>
                  <span>
                    <strong>Dataset:</strong> {image.document.dataset_number}
                  </span>
                </>
              )}
              {image.page_number && (
                <>
                  <span className="text-gray-600">|</span>
                  <span>
                    <strong>Page:</strong> {image.page_number}
                  </span>
                </>
              )}
              {image.width && image.height && (
                <>
                  <span className="text-gray-600">|</span>
                  <span>
                    <strong>Size:</strong> {image.width} x {image.height}
                  </span>
                </>
              )}
            </div>

            {/* Share Buttons */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400 mr-2">Share:</span>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-black text-white rounded hover:opacity-80"
                title="Share on X"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-[#1877F2] text-white rounded hover:opacity-80"
                title="Share on Facebook"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href={`https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-[#FF4500] text-white rounded hover:opacity-80"
                title="Share on Reddit"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                </svg>
              </a>
              <a
                href={imageUrl}
                download
                className="p-2 bg-gray-600 text-white rounded hover:opacity-80"
                title="Download Image"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
