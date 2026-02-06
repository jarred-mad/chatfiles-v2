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
  file_path_r2: string | null;
  file_size_bytes: number | null;
  dataset_number: number;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

function getFullUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${R2_PUBLIC_URL}/${path}`;
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
      `SELECT filename FROM documents WHERE id = $1 AND document_type = 'video'`,
      [id]
    );

    const video = result[0];
    if (!video) {
      return { title: 'Video Not Found' };
    }

    return {
      title: `${video.filename} | ChatFiles.org Videos`,
      description: `Video ${video.filename} from the DOJ Epstein Files`,
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
      `SELECT id, filename, file_path_r2, file_size_bytes, dataset_number
       FROM documents WHERE id = $1 AND document_type = 'video'`,
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
  const fileSize = video.file_size_bytes;
  const thumbnailUrl = `${R2_PUBLIC_URL}/thumbnails/${id}.jpg`;

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
              poster={thumbnailUrl}
            >
              <source src={videoUrl} type="video/mp4" />
              <source src={videoUrl} type="video/quicktime" />
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
            {video.filename}
          </h1>

          <div className="flex flex-wrap gap-4 text-gray-400 text-sm mb-6">
            <span className="bg-gray-700 px-3 py-1 rounded">
              Dataset {video.dataset_number}
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

          {/* Actions */}
          <div className="flex flex-wrap gap-3 mb-6">
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

          {/* Share Buttons */}
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Share this video</h3>
            <div className="flex gap-3">
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                  `https://chatfiles.org/videos/${video.id}`
                )}&text=${encodeURIComponent(
                  `Watch ${video.filename} from DOJ Epstein Files`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:opacity-80 transition-opacity"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Twitter
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  `https://chatfiles.org/videos/${video.id}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:opacity-80 transition-opacity"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </a>
              <a
                href={`https://www.reddit.com/submit?url=${encodeURIComponent(
                  `https://chatfiles.org/videos/${video.id}`
                )}&title=${encodeURIComponent(video.filename)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#FF4500] text-white rounded-lg hover:opacity-80 transition-opacity"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                </svg>
                Reddit
              </a>
            </div>
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
