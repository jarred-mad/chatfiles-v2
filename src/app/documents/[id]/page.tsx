import Link from 'next/link';
import { notFound } from 'next/navigation';
import AdSlot from '@/components/ui/AdSlot';
import PDFViewer from '@/components/ui/PDFViewer';
import { query } from '@/lib/database';

const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-e8b8792b476a4216b2cbd491f9d61af0.r2.dev';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface DocumentRow {
  id: string;
  filename: string;
  dataset_number: number;
  document_type: string | null;
  file_path_r2: string | null;
  file_size_bytes: number | null;
  page_count: number | null;
  text_content: string | null;
  ocr_confidence: number | null;
}

interface MentionedNameRow {
  name: string;
  frequency: number;
}

interface ExtractedImageRow {
  id: string;
  page_number: number | null;
  width: number | null;
  height: number | null;
  has_faces: boolean;
  file_path_r2: string | null;
}

interface RelatedDocRow {
  id: string;
  filename: string;
  dataset_number: number;
}

async function getDocument(id: string) {
  try {
    // Try to fetch from database
    const docs = await query<DocumentRow>(
      'SELECT * FROM documents WHERE id = $1',
      [id]
    );

    if (docs.length === 0) {
      return null;
    }

    const doc = docs[0];

    // Fetch mentioned names
    const names = await query<MentionedNameRow>(
      'SELECT name, frequency FROM mentioned_names WHERE document_id = $1 ORDER BY frequency DESC LIMIT 20',
      [id]
    );

    // Fetch extracted images
    const images = await query<ExtractedImageRow>(
      'SELECT id, page_number, width, height, has_faces, file_path_r2 FROM extracted_images WHERE document_id = $1 ORDER BY page_number',
      [id]
    );

    // Fetch related documents (same dataset, excluding current)
    const related = await query<RelatedDocRow>(
      'SELECT id, filename, dataset_number FROM documents WHERE dataset_number = $1 AND id != $2 LIMIT 5',
      [doc.dataset_number, id]
    );

    // Fetch previous and next documents (by filename order in same dataset)
    const prevDoc = await query<{ id: string }>(
      `SELECT id FROM documents
       WHERE dataset_number = $1 AND filename < $2
       ORDER BY filename DESC LIMIT 1`,
      [doc.dataset_number, doc.filename]
    );

    const nextDoc = await query<{ id: string }>(
      `SELECT id FROM documents
       WHERE dataset_number = $1 AND filename > $2
       ORDER BY filename ASC LIMIT 1`,
      [doc.dataset_number, doc.filename]
    );

    // Construct full R2 URL for the PDF
    let pdfUrl = doc.file_path_r2;
    if (pdfUrl && !pdfUrl.startsWith('http')) {
      // Construct URL from dataset and filename
      const datasetFolder = `DataSet_${doc.dataset_number}`;
      pdfUrl = `${R2_PUBLIC_URL}/documents/${datasetFolder}/${doc.filename}`;
    }

    return {
      id: doc.id,
      filename: doc.filename,
      dataset_number: doc.dataset_number,
      document_type: doc.document_type || 'document',
      text_content: doc.text_content || '',
      ocr_confidence: doc.ocr_confidence || 0,
      page_count: doc.page_count || 1,
      file_size_bytes: doc.file_size_bytes || 0,
      file_path_r2: pdfUrl,
      mentioned_names: names.map(n => n.name),
      extracted_images: images.map(img => ({
        id: img.id,
        page: img.page_number || 1,
        width: img.width || 0,
        height: img.height || 0,
        has_faces: img.has_faces,
        file_path_r2: img.file_path_r2,
      })),
      related_documents: related.map(r => ({
        id: r.id,
        filename: r.filename,
        dataset_number: r.dataset_number,
      })),
      prev_id: prevDoc[0]?.id || null,
      next_id: nextDoc[0]?.id || null,
    };
  } catch (error) {
    console.error('Database error:', error);
    return null;
  }
}

export default async function DocumentPage({ params }: PageProps) {
  const { id } = await params;
  const doc = await getDocument(id);

  if (!doc) {
    notFound();
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getTypeBadgeClass = (docType: string) => {
    const classes: Record<string, string> = {
      email: 'badge-email',
      court_doc: 'badge-court',
      fbi_report: 'badge-fbi',
      photo: 'badge-photo',
      video: 'badge-video',
      transcript: 'badge-transcript',
    };
    return classes[docType] || 'badge-other';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 py-3">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center text-sm text-gray-500">
            <Link href="/" className="hover:text-accent">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href={`/browse?dataset=${doc.dataset_number}`} className="hover:text-accent">
              Dataset {doc.dataset_number}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 truncate max-w-xs">{doc.filename}</span>
          </nav>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="bg-gray-100 border-b border-gray-200 py-2">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {doc.prev_id ? (
              <Link
                href={`/documents/${doc.prev_id}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-400 cursor-not-allowed">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </span>
            )}
            {doc.next_id ? (
              <Link
                href={`/documents/${doc.next_id}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700"
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-md text-sm text-gray-400 cursor-not-allowed">
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            )}
          </div>
          <Link
            href="/photos?type=people"
            className="text-sm text-accent hover:text-accent-hover font-medium"
          >
            Back to Photos
          </Link>
        </div>
      </div>

      {/* Document Header */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{doc.filename}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className={`badge ${getTypeBadgeClass(doc.document_type)}`}>
                  {doc.document_type.replace('_', ' ')}
                </span>
                <span className="text-sm text-gray-500">
                  Dataset {doc.dataset_number}
                </span>
                {doc.page_count > 0 && (
                  <span className="text-sm text-gray-500">{doc.page_count} pages</span>
                )}
                {doc.file_size_bytes > 0 && (
                  <span className="text-sm text-gray-500">
                    {formatFileSize(doc.file_size_bytes)}
                  </span>
                )}
                {doc.ocr_confidence > 0 && (
                  <span className="text-sm text-gray-500">
                    {Math.round(doc.ocr_confidence * 100)}% OCR confidence
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {doc.file_path_r2 && (
                <a
                  href={doc.file_path_r2}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-md hover:bg-navy-light transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Download PDF
                </a>
              )}
              <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium">
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
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <main className="flex-1">
            {/* PDF Viewer */}
            {doc.file_path_r2 && (
              <div className="bg-white rounded-lg shadow-sm mb-6 h-[800px]">
                <PDFViewer url={doc.file_path_r2} />
              </div>
            )}

            {/* Transcription */}
            {doc.text_content && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="border-b border-gray-200 px-4 py-3">
                  <h2 className="font-semibold text-gray-900">OCR Transcription</h2>
                </div>
                <div className="p-4 max-h-[600px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700 leading-relaxed">
                    {doc.text_content}
                  </pre>
                </div>
              </div>
            )}
          </main>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 flex-shrink-0 space-y-6">
            {/* Mentioned Names */}
            {doc.mentioned_names.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Mentioned Names</h3>
                <div className="space-y-2">
                  {doc.mentioned_names.map((name) => (
                    <Link
                      key={name}
                      href={`/search?q=${encodeURIComponent(name)}`}
                      className="block text-sm text-accent hover:text-accent-hover"
                    >
                      {name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Extracted Images */}
            {doc.extracted_images.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Photos in this Document ({doc.extracted_images.length})
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {doc.extracted_images.slice(0, 6).map((img) => (
                    <div
                      key={img.id}
                      className="aspect-square bg-gray-100 rounded relative overflow-hidden"
                    >
                      {img.file_path_r2 && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={img.file_path_r2.startsWith('http') ? img.file_path_r2 : `${R2_PUBLIC_URL}/${img.file_path_r2}`}
                          alt={`Image from page ${img.page}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {img.has_faces && (
                        <span className="absolute top-1 right-1 bg-accent text-white text-xs px-1 rounded">
                          Face
                        </span>
                      )}
                      <span className="absolute bottom-1 left-1 text-xs text-white bg-black/50 px-1 rounded">
                        p.{img.page}
                      </span>
                    </div>
                  ))}
                </div>
                {doc.extracted_images.length > 6 && (
                  <Link
                    href={`/photos?document=${doc.id}`}
                    className="block text-center text-sm text-accent hover:text-accent-hover mt-3"
                  >
                    View all {doc.extracted_images.length} images
                  </Link>
                )}
              </div>
            )}

            {/* Related Documents */}
            {doc.related_documents.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Related Documents
                </h3>
                <div className="space-y-3">
                  {doc.related_documents.map((related) => (
                    <Link
                      key={related.id}
                      href={`/documents/${related.id}`}
                      className="block p-2 hover:bg-gray-50 rounded -mx-2"
                    >
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {related.filename}
                      </p>
                      <p className="text-xs text-gray-500">
                        Dataset {related.dataset_number}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Share */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Share</h3>
              <div className="flex gap-2">
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                    `https://chatfiles.org/documents/${doc.id}`
                  )}&text=${encodeURIComponent(
                    `View ${doc.filename} from DOJ Epstein Files`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 bg-[#1DA1F2] text-white text-sm text-center rounded hover:opacity-90"
                >
                  Twitter
                </a>
                <a
                  href={`https://www.reddit.com/submit?url=${encodeURIComponent(
                    `https://chatfiles.org/documents/${doc.id}`
                  )}&title=${encodeURIComponent(doc.filename)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 bg-[#FF4500] text-white text-sm text-center rounded hover:opacity-90"
                >
                  Reddit
                </a>
              </div>
            </div>

            {/* Ad slot */}
            <AdSlot size="sidebar" id="document-sidebar" />
          </aside>
        </div>
      </div>
    </div>
  );
}
