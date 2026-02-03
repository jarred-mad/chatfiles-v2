import Link from 'next/link';
import { notFound } from 'next/navigation';
import AdSlot from '@/components/ui/AdSlot';
import { query } from '@/lib/database';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface VideoRow {
  id: string;
  filename: string;
  file_path_r2: string | null;
  file_size_bytes: number | null;
  dataset_number: number;
  text_content: string | null;
  created_at: string;
}

interface RelatedRow {
  id: string;
  filename: string;
  dataset_number: number;
  file_size_bytes: number | null;
}

async function getVideo(id: string) {
  try {
    const result = await query<VideoRow>(
      `SELECT id, filename, file_path_r2, file_size_bytes, dataset_number, text_content, created_at
       FROM documents
       WHERE id = $1`,
      [id]
    );

    if (result.length === 0) {
      return null;
    }

    const video = result[0];

    // Get related videos from same dataset
    const relatedVideos = await query<RelatedRow>(
      `SELECT id, filename, dataset_number, file_size_bytes
       FROM documents
       WHERE document_type = 'video'
       AND dataset_number = $1
       AND id != $2
       ORDER BY filename
       LIMIT 5`,
      [video.dataset_number, id]
    );

    // Get related documents from same dataset
    const relatedDocs = await query<RelatedRow>(
      `SELECT id, filename, dataset_number, file_size_bytes
       FROM documents
       WHERE document_type != 'video'
       AND dataset_number = $1
       ORDER BY filename
       LIMIT 5`,
      [video.dataset_number]
    );

    return {
      id: video.id,
      filename: video.filename,
      video_path_r2: video.file_path_r2,
      file_size_bytes: video.file_size_bytes || 0,
      dataset_number: video.dataset_number,
      description: video.text_content || 'Video file from the DOJ document archive.',
      created_at: video.created_at,
      related_videos: relatedVideos.map(v => ({
        id: v.id,
        filename: v.filename,
        file_size_bytes: v.file_size_bytes || 0,
      })),
      related_documents: relatedDocs.map(d => ({
        id: d.id,
        filename: d.filename,
        dataset_number: d.dataset_number,
      })),
    };
  } catch (error) {
    console.error('Failed to fetch video:', error);
    return null;
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export default async function VideoPlayerPage({ params }: PageProps) {
  const { id } = await params;
  const video = await getVideo(id);

  if (!video) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Breadcrumb */}
      <div className="bg-gray-800 py-3">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center text-sm text-gray-400">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/videos" className="hover:text-white">
              Videos
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white truncate max-w-xs">{video.filename}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <main className="flex-1">
            {/* Video Player */}
            <div className="bg-black rounded-lg overflow-hidden">
              <div className="aspect-video relative">
                {video.video_path_r2 ? (
                  <video
                    controls
                    className="w-full h-full"
                    preload="metadata"
                  >
                    <source src={video.video_path_r2} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <div className="text-center text-white">
                      <svg
                        className="w-20 h-20 mx-auto mb-4 text-gray-600"
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
                      <p className="text-gray-400">Video file not available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Video Info */}
            <div className="bg-gray-800 rounded-lg p-6 mt-4">
              <h1 className="text-xl font-bold text-white">{video.filename}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                <span>Dataset {video.dataset_number}</span>
                <span>{formatFileSize(video.file_size_bytes)}</span>
              </div>
              {video.description && (
                <p className="text-gray-300 mt-4">{video.description}</p>
              )}

              {/* Actions */}
              {video.video_path_r2 && (
                <div className="flex gap-3 mt-6">
                  <a
                    href={video.video_path_r2}
                    download
                    className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-hover transition-colors text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Download Video
                  </a>
                </div>
              )}
            </div>
          </main>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 flex-shrink-0 space-y-6">
            {/* Related Videos */}
            {video.related_videos.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-3">Related Videos</h3>
                <div className="space-y-3">
                  {video.related_videos.map((rv) => (
                    <Link
                      key={rv.id}
                      href={`/videos/${rv.id}`}
                      className="flex gap-3 p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                    >
                      <div className="w-24 h-14 bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-6 h-6 text-gray-500"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{rv.filename}</p>
                        <p className="text-xs text-gray-400">{formatFileSize(rv.file_size_bytes)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Related Documents */}
            {video.related_documents.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-3">Related Documents</h3>
                <div className="space-y-2">
                  {video.related_documents.map((doc) => (
                    <Link
                      key={doc.id}
                      href={`/documents/${doc.id}`}
                      className="block p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                    >
                      <p className="text-sm text-white truncate">{doc.filename}</p>
                      <p className="text-xs text-gray-400">Dataset {doc.dataset_number}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Ad slot */}
            <AdSlot size="sidebar" id="video-sidebar" />
          </aside>
        </div>
      </div>
    </div>
  );
}
