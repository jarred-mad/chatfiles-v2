import Link from 'next/link';
import AdSlot from '@/components/ui/AdSlot';

interface PageProps {
  params: Promise<{ id: string }>;
}

// Mock video data
async function getVideo(id: string) {
  return {
    id,
    filename: 'surveillance_footage_palmbeach_2015.mp4',
    video_path_r2: '/videos/DataSet_10/surveillance_footage_palmbeach_2015.mp4',
    thumbnail_path: '/thumbnails/video_1.jpg',
    duration: 185, // 3:05
    file_size_bytes: 45000000,
    dataset_number: 10,
    description: 'Security camera footage from Palm Beach residence. This video was recovered from surveillance systems during the investigation.',
    source_document: 'Evidence_Collection_Report_2019.pdf',
    source_document_id: 'doc_456',
    created_at: '2015-06-15T14:30:00Z',
    processed_at: '2024-01-15T10:00:00Z',
    related_documents: [
      { id: 'doc_001', filename: 'FBI_302_Surveillance_Report.pdf', dataset_number: 10 },
      { id: 'doc_002', filename: 'Evidence_Chain_of_Custody.pdf', dataset_number: 10 },
      { id: 'doc_003', filename: 'Property_Records_PalmBeach.pdf', dataset_number: 8 },
    ],
    related_videos: [
      { id: 'video_2', filename: 'surveillance_footage_2.mp4', duration: 120 },
      { id: 'video_3', filename: 'surveillance_footage_3.mp4', duration: 95 },
    ],
  };
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function VideoPlayerPage({ params }: PageProps) {
  const { id } = await params;
  const video = await getVideo(id);

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
                {/* HTML5 Video Player */}
                <video
                  controls
                  className="w-full h-full"
                  poster={video.thumbnail_path}
                  preload="metadata"
                >
                  <source src={video.video_path_r2} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                {/* Fallback for demo */}
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 pointer-events-none opacity-0 hover:opacity-0">
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
                    <p className="text-gray-400">Video player</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Info */}
            <div className="bg-gray-800 rounded-lg p-6 mt-4">
              <h1 className="text-xl font-bold text-white">{video.filename}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                <span>Dataset {video.dataset_number}</span>
                <span>{formatDuration(video.duration)}</span>
                <span>{formatFileSize(video.file_size_bytes)}</span>
              </div>
              <p className="text-gray-300 mt-4">{video.description}</p>

              {/* Actions */}
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
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors text-sm font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                  Share
                </button>
              </div>
            </div>

            {/* Source Document */}
            {video.source_document && (
              <div className="bg-gray-800 rounded-lg p-6 mt-4">
                <h2 className="font-semibold text-white mb-3">Source Document</h2>
                <Link
                  href={`/documents/${video.source_document_id}`}
                  className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                >
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <div>
                    <p className="text-white font-medium">{video.source_document}</p>
                    <p className="text-sm text-gray-400">View original document</p>
                  </div>
                </Link>
              </div>
            )}
          </main>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 flex-shrink-0 space-y-6">
            {/* Related Videos */}
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
                      <p className="text-xs text-gray-400">{formatDuration(rv.duration)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Related Documents */}
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

            {/* Ad slot */}
            <AdSlot size="sidebar" id="video-sidebar" />
          </aside>
        </div>
      </div>
    </div>
  );
}
