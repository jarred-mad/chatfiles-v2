export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">About ChatFiles.org</h1>
          <p className="text-gray-500 mt-2">
            Making public records accessible and searchable
          </p>
        </div>

        <div className="space-y-12">
          {/* Mission */}
          <section className="bg-white rounded-lg shadow-sm p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              ChatFiles.org is dedicated to making publicly released government documents
              accessible and searchable for researchers, journalists, and the general public.
              We believe in transparency and the public&apos;s right to access official records.
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              By applying modern technology like optical character recognition (OCR),
              full-text search, and facial recognition, we transform raw document dumps
              into a searchable database that anyone can explore.
            </p>
          </section>

          {/* What Are These Files */}
          <section className="bg-white rounded-lg shadow-sm p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">What Are These Files?</h2>
            <p className="text-gray-600 leading-relaxed">
              The documents in this archive are publicly released records from the
              U.S. Department of Justice as part of the Epstein disclosure. This release
              was mandated by the EPSTEIN&apos;S VICTIMS Act, which requires the DOJ to
              make certain investigative materials available to the public.
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              The files include:
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
              <li>FBI 302 interview reports</li>
              <li>Court depositions and legal filings</li>
              <li>Email correspondence</li>
              <li>Financial records and transactions</li>
              <li>Photographs and media files</li>
              <li>Surveillance footage stills</li>
              <li>Travel records and flight logs</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              All documents are official public records released by the U.S. government
              and are available for public inspection.
            </p>
          </section>

          {/* How We Process Files */}
          <section className="bg-white rounded-lg shadow-sm p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">How We Process Files</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Our processing pipeline ensures maximum searchability and accessibility:
            </p>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-navy text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">OCR Processing</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    We use OCRmyPDF to extract text from scanned documents. This creates
                    a searchable text layer while preserving the original document format.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-navy text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Image Extraction</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Embedded images are extracted from PDFs using PyMuPDF, preserving
                    original quality and metadata.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-navy text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Facial Recognition</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    InsightFace detects and clusters faces across the archive. Known
                    individuals are labeled based on reference photos from public sources.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-navy text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Name Extraction</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Named entity recognition (NER) using spaCy identifies person names
                    mentioned in documents, enabling search by name.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-navy text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                  5
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Full-Text Indexing</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    All extracted text is indexed in Meilisearch for fast, typo-tolerant
                    full-text search across the entire archive.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Legal Disclaimer */}
          <section id="disclaimer" className="bg-red-50 border border-red-200 rounded-lg p-6 md:p-8">
            <h2 className="text-xl font-bold text-red-900 mb-4">Legal Disclaimer</h2>
            <div className="space-y-4 text-red-800">
              <p>
                <strong>All documents hosted on ChatFiles.org are publicly released
                U.S. government records.</strong> These documents were made available
                by the Department of Justice and are part of the public record.
              </p>
              <p>
                <strong>ChatFiles.org makes no claims about the guilt or innocence
                of any individual</strong> mentioned in these documents. The presence
                of a name in a document does not imply wrongdoing.
              </p>
              <p>
                <strong>Facial recognition matches are probabilistic, not definitive.</strong>
                {' '}Our system uses machine learning to identify similar faces, but false
                positives can occur. Users should verify identifications independently.
              </p>
              <p>
                <strong>This site is not affiliated with the DOJ, FBI, or any government
                agency.</strong> We are an independent organization providing public access
                to already-public documents.
              </p>
              <p>
                <strong>For legal inquiries</strong>, please contact us at{' '}
                <a href="mailto:legal@chatfiles.org" className="underline">
                  legal@chatfiles.org
                </a>
              </p>
            </div>
          </section>

          {/* Privacy */}
          <section id="privacy" className="bg-white rounded-lg shadow-sm p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Privacy Policy</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                ChatFiles.org respects your privacy. We collect minimal data necessary
                to operate the service:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Search queries (anonymized, for improving search quality)</li>
                <li>Basic analytics (page views, for understanding usage)</li>
                <li>IP addresses (for rate limiting and abuse prevention)</li>
              </ul>
              <p>
                We do not sell or share personal data with third parties. We use
                Google AdSense for advertising, which may use cookies according to
                Google&apos;s privacy policy.
              </p>
            </div>
          </section>

          {/* Support */}
          <section className="bg-navy text-white rounded-lg p-6 md:p-8">
            <h2 className="text-xl font-bold mb-4">Support This Project</h2>
            <p className="text-gray-300 mb-6">
              ChatFiles.org is a free public resource maintained by volunteers.
              Donations help cover server costs, development time, and ongoing
              maintenance. Every contribution makes a difference.
            </p>
            <a
              href="https://ko-fi.com/chatfiles"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311zm6.173.478c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z" />
              </svg>
              Donate on Ko-fi
            </a>
          </section>

          {/* Contact */}
          <section className="bg-white rounded-lg shadow-sm p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Contact</h2>
            <div className="space-y-3 text-gray-600">
              <p>
                <strong>General inquiries:</strong>{' '}
                <a href="mailto:contact@chatfiles.org" className="text-accent hover:text-accent-hover">
                  contact@chatfiles.org
                </a>
              </p>
              <p>
                <strong>Press inquiries:</strong>{' '}
                <a href="mailto:press@chatfiles.org" className="text-accent hover:text-accent-hover">
                  press@chatfiles.org
                </a>
              </p>
              <p>
                <strong>Legal inquiries:</strong>{' '}
                <a href="mailto:legal@chatfiles.org" className="text-accent hover:text-accent-hover">
                  legal@chatfiles.org
                </a>
              </p>
              <p>
                <strong>Technical issues:</strong>{' '}
                <a href="mailto:tech@chatfiles.org" className="text-accent hover:text-accent-hover">
                  tech@chatfiles.org
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
