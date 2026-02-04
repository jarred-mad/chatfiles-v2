import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { notableNames, getPersonBySlug, getCategoryInfo } from '@/lib/notable-names';
import { query } from '@/lib/database';
import { AdBanner } from '@/components/ui/AdSlot';

const R2_URL = "https://pub-e8b8792b476a4216b2cbd491f9d61af0.r2.dev";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Photo mapping for special cases
const PHOTO_MAP: Record<string, string> = {
  "Jean-Luc Brunel": "Jean-Luc_Brunel_2001.jpg",
  "Leon Black": "Leon _Black.jpg",
  "Nadia Marcinkova": "Nadia_Marcinko.jpg",
  "Dr. Mehmet Oz": "Mehmet_Oz.jpg",
  "Mortimer Zuckerman": "Mort_Zuckerman.jpg",
};

function getPhotoUrl(name: string): string {
  if (PHOTO_MAP[name]) {
    return `${R2_URL}/people/${PHOTO_MAP[name]}`;
  }
  const filename = name.replace(/\s+/g, '_').replace(/[.]/g, '') + '.jpg';
  return `${R2_URL}/people/${filename}`;
}

// Generate static params for all people
export async function generateStaticParams() {
  return notableNames.map((person) => ({
    slug: person.slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const person = getPersonBySlug(slug);

  if (!person) {
    return { title: 'Person Not Found' };
  }

  const category = getCategoryInfo(person.category);
  const title = `${person.name} - Epstein Files Connection | ChatFiles.org`;
  const description = `${person.name}'s association with the Jeffrey Epstein case. ${person.description} Search documents mentioning ${person.name} in the DOJ Epstein Files.`;

  return {
    title,
    description,
    keywords: [
      person.name,
      'Epstein files',
      'DOJ documents',
      category?.label || person.category,
      'Jeffrey Epstein',
      'document search',
    ],
    openGraph: {
      title,
      description,
      type: 'profile',
      images: [{ url: getPhotoUrl(person.name), alt: person.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [getPhotoUrl(person.name)],
    },
  };
}

interface DocumentRow {
  id: string;
  filename: string;
  dataset_number: number;
  document_type: string | null;
  page_count: number | null;
}


const MEILISEARCH_URL = process.env.MEILISEARCH_URL;
const MEILISEARCH_API_KEY = process.env.MEILISEARCH_API_KEY;

async function getPersonDocuments(name: string): Promise<{ documents: DocumentRow[]; totalMentions: number; totalDocuments: number }> {
  try {
    // Try Meilisearch first for better search results
    if (MEILISEARCH_URL && MEILISEARCH_API_KEY) {
      try {
        const response = await fetch(`${MEILISEARCH_URL}/indexes/documents/search`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${MEILISEARCH_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: name,
            limit: 20,
            attributesToRetrieve: ['id', 'filename', 'dataset_number', 'document_type', 'page_count'],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          return {
            documents: data.hits.map((hit: { id: string; filename: string; dataset_number: number; document_type: string | null; page_count: number | null }) => ({
              id: hit.id,
              filename: hit.filename,
              dataset_number: hit.dataset_number,
              document_type: hit.document_type,
              page_count: hit.page_count,
            })),
            totalMentions: data.estimatedTotalHits,
            totalDocuments: data.estimatedTotalHits,
          };
        }
      } catch (meiliError) {
        console.warn('Meilisearch failed, falling back to PostgreSQL:', meiliError);
      }
    }

    // Fallback to PostgreSQL full-text search
    const results = await query<DocumentRow>(`
      SELECT id, filename, dataset_number, document_type, page_count
      FROM documents
      WHERE text_content ILIKE $1 OR filename ILIKE $1
      ORDER BY dataset_number ASC, filename ASC
      LIMIT 20
    `, [`%${name}%`]);

    // Get total count
    const countResult = await query<{ count: string }>(`
      SELECT COUNT(*) as count
      FROM documents
      WHERE text_content ILIKE $1 OR filename ILIKE $1
    `, [`%${name}%`]);

    const total = parseInt(countResult[0]?.count || '0', 10);

    return {
      documents: results,
      totalMentions: total,
      totalDocuments: total,
    };
  } catch (error) {
    console.error('Failed to fetch person documents:', error);
    return { documents: [], totalMentions: 0, totalDocuments: 0 };
  }
}

// Extended profiles for key figures
const EXTENDED_PROFILES: Record<string, {
  summary: string;
  connectionType: string[];
  keyPoints: string[];
  sources: string[];
}> = {
  'donald-trump': {
    summary: 'Donald Trump, the 45th and 47th President of the United States, appears thousands of times in the DOJ Epstein Files release. The documents include FBI-compiled unverified tip-line allegations, as well as references in contact books and social records from the 1980s and 1990s when both operated in New York real estate and social circles.',
    connectionType: ['Contact Book', 'FBI Tips', 'Social Records', 'Media Coverage'],
    keyPoints: [
      'Thousands of document references across multiple datasets',
      'FBI compiled unverified tip-line allegations',
      'Known social acquaintance in 1980s-1990s New York',
      'Publicly stated he banned Epstein from Mar-a-Lago',
      'No charges or accusations of wrongdoing in official documents',
    ],
    sources: ['DOJ Epstein Files Release', 'FBI Tip Line Records', 'Contact Book Documents'],
  },
  'bill-clinton': {
    summary: 'Former President Bill Clinton appears extensively in the Epstein files, including flight logs showing multiple trips on Epstein\'s aircraft and photographs found in Epstein\'s residence. Epstein invoked the Fifth Amendment when asked about Clinton during a 2016 deposition.',
    connectionType: ['Flight Logs', 'Photographs', 'Deposition Records', 'Contact Book'],
    keyPoints: [
      'Flight logs document multiple trips on Epstein\'s Boeing 727',
      'Photographs found in Epstein\'s Manhattan residence',
      'Epstein invoked Fifth Amendment about Clinton in 2016 deposition',
      'Trips reportedly connected to Clinton Foundation humanitarian work',
      'Clinton representatives deny knowledge of any wrongdoing',
    ],
    sources: ['Flight Log Documents', 'Deposition Transcripts', 'Photo Evidence Records'],
  },
  'prince-andrew': {
    summary: 'Prince Andrew, Duke of York, is one of the most frequently mentioned figures in the Epstein files with hundreds of references. Documents include photographs, emails about Buckingham Palace dinners, and communications with Ghislaine Maxwell. He was stripped of royal titles following the scandal.',
    connectionType: ['Photographs', 'Email Correspondence', 'Witness Testimony', 'Flight Logs'],
    keyPoints: [
      'Hundreds of document mentions across the files',
      'Photographs with unidentified individuals',
      'Email correspondence about royal dinners and meetings',
      'Reached civil settlement with accuser Virginia Giuffre',
      'Stripped of royal titles and patronages',
    ],
    sources: ['Email Records', 'Photo Archives', 'Court Documents', 'Witness Depositions'],
  },
  'bill-gates': {
    summary: 'Microsoft co-founder Bill Gates appears in documents where Epstein reportedly sent himself unverified allegations. Gates has acknowledged meeting with Epstein but denies any inappropriate conduct. A Gates spokesperson called the claims in the files "absurd and completely false."',
    connectionType: ['Meeting Records', 'Email References', 'Third-Party Allegations'],
    keyPoints: [
      'Epstein sent himself unverified allegations about Gates',
      'Acknowledged meetings occurred after Epstein\'s 2008 conviction',
      'Gates Foundation received donations connected to Epstein',
      'Gates spokesperson denies all allegations',
      'Meetings reportedly focused on philanthropy discussions',
    ],
    sources: ['Email Archives', 'Meeting Schedules', 'Foundation Records'],
  },
  'elon-musk': {
    summary: 'Tesla and SpaceX CEO Elon Musk appears in email exchanges from 2012-2014 discussing potential island visits, along with scheduling notes. Musk has stated publicly that he declined invitations and never visited Epstein\'s island.',
    connectionType: ['Email Exchanges', 'Scheduling Documents'],
    keyPoints: [
      'Email exchanges from 2012-2014 period',
      'Scheduling notes reference potential island visits',
      'Musk states he declined all invitations',
      'No evidence of island visits in flight logs',
      'Communications occurred before 2019 arrest',
    ],
    sources: ['Email Archives', 'Scheduling Documents'],
  },
  'ghislaine-maxwell': {
    summary: 'Ghislaine Maxwell was Jeffrey Epstein\'s longtime companion and convicted accomplice. She is currently serving a 20-year federal prison sentence for sex trafficking of minors. The files extensively document her role in recruiting and grooming victims.',
    connectionType: ['Court Documents', 'Witness Testimony', 'Email Records', 'Photographs'],
    keyPoints: [
      'Convicted on five of six federal charges in December 2021',
      'Sentenced to 20 years in federal prison',
      'Documented as key recruiter and organizer',
      'Maintained connections with high-profile individuals',
      'Central figure in trafficking operation',
    ],
    sources: ['Court Records', 'Trial Transcripts', 'Victim Testimony', 'DOJ Documents'],
  },
  'alan-dershowitz': {
    summary: 'Harvard Law professor emeritus Alan Dershowitz was part of Epstein\'s legal defense team and appears in photographs and documents. He has been accused by some victims but has consistently denied any wrongdoing and has actively disputed allegations.',
    connectionType: ['Legal Representation', 'Photographs', 'Flight Logs', 'Depositions'],
    keyPoints: [
      'Served on Epstein\'s legal defense team',
      'Photographed with Epstein on multiple occasions',
      'Appears in flight log documentation',
      'Consistently denied all accusations',
      'Filed defamation suits against accusers',
    ],
    sources: ['Legal Documents', 'Flight Logs', 'Deposition Records'],
  },
  'leslie-wexner': {
    summary: 'L Brands founder Leslie Wexner was Epstein\'s primary financial patron for decades. Documents detail the transfer of vast assets including a Manhattan mansion, private planes, and power of attorney that gave Epstein control over Wexner\'s finances.',
    connectionType: ['Financial Records', 'Property Transfers', 'Legal Documents'],
    keyPoints: [
      'Primary source of Epstein\'s wealth and status',
      'Transferred Manhattan mansion worth ~$77 million',
      'Granted Epstein power of attorney',
      'Cut ties in 2007 citing misappropriation of funds',
      'No criminal charges filed against Wexner',
    ],
    sources: ['Financial Records', 'Property Documents', 'Legal Filings'],
  },
};

export default async function PersonProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const person = getPersonBySlug(slug);

  if (!person) {
    notFound();
  }

  const category = getCategoryInfo(person.category);
  const { documents, totalMentions, totalDocuments } = await getPersonDocuments(person.name);
  const extendedProfile = EXTENDED_PROFILES[slug];

  // Get related people in same category
  const relatedPeople = notableNames
    .filter(p => p.category === person.category && p.slug !== slug)
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-navy text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Photo */}
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden bg-gray-700 flex-shrink-0 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getPhotoUrl(person.name)}
                alt={person.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {category && (
                  <span
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{ backgroundColor: category.color }}
                  >
                    {category.label}
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">{person.name}</h1>
              <p className="text-gray-300 text-lg">{person.description}</p>

              {/* Stats */}
              <div className="flex gap-6 mt-6">
                <div>
                  <div className="text-2xl font-bold text-accent">{totalDocuments.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Documents</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-accent">{totalMentions.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Total Mentions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-amber-800">
              <strong>Important:</strong> Appearing in these documents does not indicate wrongdoing.
              Names appear in various contexts including contact books, flight logs, photographs,
              witness statements, and unverified tips. {person.name} has not been charged with any
              crimes related to the Epstein investigation.
            </p>
          </div>
        </div>
      </section>

      {/* Ad Banner */}
      <AdBanner className="py-4 bg-gray-100" />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Extended Profile */}
        {extendedProfile ? (
          <section className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Case Association Summary</h2>
            <p className="text-gray-700 mb-6">{extendedProfile.summary}</p>

            {/* Connection Types */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Document Types</h3>
              <div className="flex flex-wrap gap-2">
                {extendedProfile.connectionType.map((type) => (
                  <span key={type} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {type}
                  </span>
                ))}
              </div>
            </div>

            {/* Key Points */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Key Points from Documents</h3>
              <ul className="space-y-2">
                {extendedProfile.keyPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-700">
                    <svg className="w-5 h-5 text-navy flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Sources */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Document Sources</h3>
              <div className="flex flex-wrap gap-2">
                {extendedProfile.sources.map((source) => (
                  <span key={source} className="px-2 py-1 bg-navy/10 text-navy rounded text-xs font-medium">
                    {source}
                  </span>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <section className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">About {person.name}</h2>
            <p className="text-gray-700 mb-4">{person.description}</p>
            <p className="text-gray-600 text-sm">
              {person.name} appears in the DOJ Epstein Files release as part of the publicly disclosed documents.
              The context of these mentions varies and may include contact information, correspondence references,
              witness statements, or other documentary evidence compiled during investigations.
            </p>
          </section>
        )}

        {/* Documents Section */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Documents Mentioning {person.name}</h2>
            <Link
              href={`/search?q=${encodeURIComponent(person.name)}`}
              className="text-accent hover:text-accent-hover text-sm font-medium"
            >
              Search All {totalDocuments} &rarr;
            </Link>
          </div>

          {documents.length > 0 ? (
            <div className="space-y-3">
              {documents.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/documents/${doc.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-accent hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{doc.filename}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span>Dataset {doc.dataset_number}</span>
                        {doc.page_count && <span>{doc.page_count} pages</span>}
                        {doc.document_type && (
                          <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                            {doc.document_type}
                          </span>
                        )}
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No indexed documents found.
              <Link href={`/search?q=${encodeURIComponent(person.name)}`} className="text-accent hover:underline ml-1">
                Try searching
              </Link>
            </p>
          )}
        </section>

        {/* Related People */}
        {relatedPeople.length > 0 && (
          <section className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Other {category?.label || person.category}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {relatedPeople.map((related) => (
                <Link
                  key={related.slug}
                  href={`/people/${related.slug}`}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-accent hover:shadow-sm transition-all"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getPhotoUrl(related.name)}
                      alt={related.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="font-medium text-gray-900 text-sm truncate">{related.name}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="bg-navy rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Search the Full Archive</h2>
          <p className="text-gray-300 mb-4">
            Explore all documents mentioning {person.name} and related keywords
          </p>
          <Link
            href={`/search?q=${encodeURIComponent(person.name)}`}
            className="inline-block bg-accent hover:bg-accent-hover text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Search Documents
          </Link>
        </section>

        {/* Breadcrumb / Back */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <Link href="/people" className="text-accent hover:text-accent-hover font-medium">
            &larr; Back to All 100 Notable Names
          </Link>
        </div>
      </div>
    </div>
  );
}
