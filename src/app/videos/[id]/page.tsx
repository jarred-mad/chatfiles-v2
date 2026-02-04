import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { query } from '@/lib/database';
import { AdBanner } from '@/components/ui/AdSlot';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL?.trim() || 'https://pub-e8b8792b476a4216b2cbd491f9d61af0.r2.dev';

interface VideoRow {
  id: string;
  filename: string;
  title: string | null;
  description: string | null;
  duration_seconds: number | null;
  file_path_r2: string | null;
  file_size_bytes: string | null;
  created_at: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

function getFullUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${R2_PUBLIC_URL}/${path}`;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`;
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const result = await query<VideoRow>(
      'SELECT title, filename, description FROM videos WHERE id = $1',
      [id]
    );

    const video = result[0];
    if (!video) {
      return { title: 'Video Not Found' };
    }

    return {
      title: `${video.title || video.filename} | ChatFiles.org Videos`,
      description: video.description || `Video ${video.filename} from the DOJ Epstein Files`,
    };
  } catch {
    return { title: 'Video | ChatFiles.org' };
  }
}

export default async function VideoPage({ params }: PageProps) {
  const { id } = await params;

  let video: VideoRow | null = null;

  try {
    const result = await query<VideoRow>(
      `SELECT id, filename, title, description, duration_seconds, file_path_r2, file_size_bytes, created_at
       FROM videos WHERE id = $1`,
      [id]
    );
    video = result[0] || null;
  } catch (err) {
    console.error('Database error:', err);
  }

  if (!video) {
    notFound();
  }

  const videoUrl = getFullUrl(video.file_path_r2);
  const fileSize = video.file_size_bytes ? parseInt(video.file_size_bytes, 10) : null;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Video Player Section */}
      <div className="bg-black">
        <div className="max-w-6xl mx-auto">
          {videoUrl ? (
            <video
              controls
              autoPlay
              className="w-full aspect-video"
              poster=""
            >
              <source src={videoUrl} type="video/mp4" />
              <source src={videoUrl} type="video/x-msvideo" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="aspect-video flex items-center justify-center">
              <p className="text-white">Video unavailable</p>
            </div>
          )}
        </div>
      </div>

      {/* Ad Banner */}
      <AdBanner className="py-4 bg-gray-800" />

      {/* Video Info */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-white mb-4">
            {video.title || video.filename}
          </h1>

          <div className="flex flex-wrap gap-4 text-gray-400 text-sm mb-6">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDuration(video.duration_seconds)}
            </span>
            {fileSize && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                {formatFileSize(fileSize)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              {video.id}
            </span>
          </div>

          {video.description && (
            <p className="text-gray-300 mb-6">{video.description}</p>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {videoUrl && (
              <a
                href={videoUrl}
                download
                className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Video
              </a>
            )}
            <Link
              href="/videos"
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Videos
            </Link>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-yellow-900/30 border border-yellow-600/50 rounded-lg">
          <p className="text-sm text-yellow-200">
            <strong>Disclaimer:</strong> This video is part of the publicly released DOJ Epstein files.
            It is provided for research and educational purposes only.
          </p>
        </div>
      </div>
    </div>
  );
}
