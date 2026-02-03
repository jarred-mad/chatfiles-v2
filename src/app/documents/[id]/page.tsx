import Link from 'next/link';
import AdSlot from '@/components/ui/AdSlot';

interface PageProps {
  params: Promise<{ id: string }>;
}

// Mock document data
async function getDocument(id: string) {
  // In production, fetch from database
  return {
    id,
    filename: 'FBI_302_Interview_Report_2019.pdf',
    dataset_number: 10,
    document_type: 'fbi_report',
    text_content: `FBI 302 INTERVIEW REPORT

Date: March 15, 2019
Location: Palm Beach, Florida

SUBJECT: Interview regarding [REDACTED]

The interview was conducted pursuant to the ongoing investigation. The subject agreed to speak voluntarily and was informed of the purpose of this interview.

STATEMENT:

The subject stated that they first became aware of the activities in question during the summer of 2008. They described their observations and interactions in detail.

[Several paragraphs of interview content would appear here in the actual document...]

The interview was concluded at 3:45 PM. The subject agreed to make themselves available for follow-up questions if needed.

Prepared by: Special Agent [REDACTED]
Reviewed by: Supervisory Special Agent [REDACTED]`,
    ocr_confidence: 0.92,
    page_count: 15,
    file_size_bytes: 2500000,
    file_path_r2: '/documents/DataSet_10/FBI_302_Interview_Report_2019.pdf',
    mentioned_names: ['Jeffrey Epstein', 'Ghislaine Maxwell', 'Virginia Giuffre'],
    extracted_images: [
      { id: 'img_001', page: 3, width: 800, height: 600, has_faces: true },
      { id: 'img_002', page: 7, width: 600, height: 400, has_faces: false },
    ],
    related_documents: [
      { id: 'doc_002', filename: 'FBI_302_Followup_2019.pdf', dataset_number: 10 },
      { id: 'doc_003', filename: 'Deposition_Related.pdf', dataset_number: 12 },
    ],
  };
}

export default async function DocumentPage({ params }: PageProps) {
  const { id } = await params;
  const doc = await getDocument(id);

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
            <Link href="/browse" className="hover:text-accent">
              Dataset {doc.dataset_number}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 truncate max-w-xs">{doc.filename}</span>
          </nav>
        </div>
      </div>

      {/* Document Header */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{doc.filename}</h1>
              <div className="flex items-center gap-3 mt-2">
                <span className={`badge ${getTypeBadgeClass(doc.document_type)}`}>
                  {doc.document_type.replace('_', ' ')}
                </span>
                <span className="text-sm text-gray-500">
                  Dataset {doc.dataset_number}
                </span>
                <span className="text-sm text-gray-500">{doc.page_count} pages</span>
                <span className="text-sm text-gray-500">
                  {formatFileSize(doc.file_size_bytes)}
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round(doc.ocr_confidence * 100)}% OCR confidence
                </span>
              </div>
            </div>
            <div className="flex gap-2">
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
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Document Preview</h2>
                <div className="text-sm text-gray-500">
                  Page 1 of {doc.page_count}
                </div>
              </div>
              <div className="aspect-[8.5/11] bg-gray-100 flex items-center justify-center">
                {/* In production, embed PDF viewer here */}
                <div className="text-center text-gray-500">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 text-gray-300"
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
                  <p>PDF viewer will be embedded here</p>
                  <a
                    href={doc.file_path_r2}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:text-accent-hover mt-2 inline-block"
                  >
                    Open PDF in new tab
                  </a>
                </div>
              </div>
            </div>

            {/* Transcription */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">OCR Transcription</h2>
                <button className="text-sm text-accent hover:text-accent-hover">
                  Copy Text
                </button>
              </div>
              <div className="p-4">
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700 leading-relaxed">
                  {doc.text_content}
                </pre>
              </div>
            </div>
          </main>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 flex-shrink-0 space-y-6">
            {/* Mentioned Names */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Mentioned Names</h3>
              {doc.mentioned_names.length > 0 ? (
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
              ) : (
                <p className="text-sm text-gray-500">No names extracted</p>
              )}
            </div>

            {/* Extracted Images */}
            {doc.extracted_images.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Photos in this Document
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {doc.extracted_images.map((img) => (
                    <div
                      key={img.id}
                      className="aspect-square bg-gray-100 rounded relative"
                    >
                      {img.has_faces && (
                        <span className="absolute top-1 right-1 bg-accent text-white text-xs px-1 rounded">
                          Face
                        </span>
                      )}
                      <span className="absolute bottom-1 left-1 text-xs text-gray-500">
                        p.{img.page}
                      </span>
                    </div>
                  ))}
                </div>
                <Link
                  href={`/photos?document=${doc.id}`}
                  className="block text-center text-sm text-accent hover:text-accent-hover mt-3"
                >
                  View all images
                </Link>
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
