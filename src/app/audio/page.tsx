import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Audio Transcripts | ChatFiles.org - Ghislaine Maxwell Proffer Sessions',
  description: 'Transcripts of Ghislaine Maxwell\'s recorded proffer sessions with the DOJ from July 2025. Full searchable transcripts of the Maxwell interviews.',
  openGraph: {
    title: 'Maxwell Proffer Session Transcripts | ChatFiles.org',
    description: 'Transcripts of Ghislaine Maxwell\'s recorded proffer sessions with the DOJ.',
  },
};

// People mentioned in the proffer sessions
const MENTIONED_PEOPLE = [
  'Bill Clinton', 'Hillary Clinton', 'Elon Musk', 'Sergey Brin', 'Robert F. Kennedy Jr.',
  'Andrew Cuomo', 'Chris Cuomo', 'John Kerry', 'Ted Kennedy', 'Leslie Wexner',
  'Richard Branson', 'Chris Tucker', 'Kevin Spacey', 'Naomi Campbell', 'Larry Summers',
  'George Soros', 'Sarah Ferguson', 'Doug Band', 'Cheryl Mills', 'Marvin Minsky',
  'Murray Gellman', 'Donald Trump', 'Prince Andrew',
];

const AUDIO_SESSIONS = [
  {
    id: 'day-1',
    title: 'Day 1 - Thursday, July 24, 2025',
    description: 'First day of Ghislaine Maxwell\'s proffer session with the DOJ. Recorded at the US Attorney\'s office.',
    participants: ['Ghislaine Maxwell', 'Spencer R. Horn (FBI)', 'DOJ Representatives', 'Defense Counsel'],
    parts: [
      { id: 'day-1-part-1', title: 'Part 1 - Opening', duration: '~2 min' },
      { id: 'day-1-part-2', title: 'Part 2', duration: '~28 min' },
      { id: 'day-1-part-3', title: 'Part 3', duration: '~1 hr 20 min' },
      { id: 'day-1-part-4', title: 'Part 4', duration: '~2 min' },
      { id: 'day-1-part-5', title: 'Part 5', duration: '~1 hr 10 min' },
      { id: 'day-1-part-6', title: 'Part 6', duration: '~42 min' },
      { id: 'day-1-part-7', title: 'Part 7', duration: '~15 min' },
    ],
  },
  {
    id: 'day-2',
    title: 'Day 2 - Friday, July 25, 2025',
    description: 'Second day of the proffer session. Covers financial matters, relationships with notable individuals, and more.',
    participants: ['Ghislaine Maxwell', 'Spencer R. Horn (FBI)', 'DOJ Representatives', 'Defense Counsel'],
    parts: [
      { id: 'day-2-part-1', title: 'Part 1', duration: '~1 hr 20 min' },
      { id: 'day-2-part-2', title: 'Part 2', duration: '~50 min' },
      { id: 'day-2-part-3', title: 'Part 3', duration: '~1 min' },
      { id: 'day-2-part-4', title: 'Part 4', duration: '~30 min' },
    ],
  },
];

export default function AudioPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              Exclusive
            </span>
            <span className="bg-purple-600/30 text-purple-200 text-xs px-3 py-1 rounded-full">
              Audio Transcripts
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Ghislaine Maxwell Proffer Session Transcripts
          </h1>
          <p className="text-gray-300 text-lg max-w-3xl">
            Complete transcripts of Ghislaine Maxwell&apos;s recorded proffer sessions with the
            Department of Justice, conducted July 24-25, 2025 at the US Attorney&apos;s office.
          </p>
        </div>
      </div>

      {/* Key Info Banner */}
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm text-amber-800">
                <strong>About this recording:</strong> These are transcripts of a proffer agreement session
                where Ghislaine Maxwell provided information to the DOJ following her conviction.
                A proffer is a formal interview where a defendant provides information in exchange for
                potential sentencing considerations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ad Banner */}

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Participants Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Session Participants</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Interviewee</h3>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-navy rounded-full flex items-center justify-center text-white font-bold">
                  GM
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Ghislaine Maxwell</p>
                  <p className="text-sm text-gray-500">Convicted associate of Jeffrey Epstein</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Interviewers</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-navy rounded-full"></span>
                  Spencer R. Horn - Assistant Special Agent in Charge, FBI New York
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-navy rounded-full"></span>
                  DOJ Deputy Attorney General&apos;s Office
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-navy rounded-full"></span>
                  Defense Counsel (Mr. Marcus)
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Notable Names Mentioned */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Notable Names Mentioned</h2>
          <div className="flex flex-wrap gap-2">
            {MENTIONED_PEOPLE.map((name) => (
              <Link
                key={name}
                href={`/search?q=${encodeURIComponent(name)}`}
                className="px-3 py-1.5 bg-gray-100 hover:bg-accent hover:text-white text-gray-700 text-sm rounded-full transition-colors"
              >
                {name}
              </Link>
            ))}
          </div>
        </div>

        {/* Audio Sessions */}
        <div className="space-y-8">
          {AUDIO_SESSIONS.map((session) => (
            <div key={session.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-navy text-white p-6">
                <h2 className="text-2xl font-bold">{session.title}</h2>
                <p className="text-gray-300 mt-2">{session.description}</p>
              </div>

              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Recording Parts</h3>
                <div className="space-y-3">
                  {session.parts.map((part) => (
                    <Link
                      key={part.id}
                      href={`/audio/${part.id}`}
                      className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">
                          <svg className="w-5 h-5 text-accent group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{part.title}</p>
                          <p className="text-sm text-gray-500">{part.duration}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-accent">
                        <span className="text-sm font-medium">View Transcript</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mt-10 p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="flex gap-3">
            <svg className="w-6 h-6 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="font-bold text-yellow-800 mb-2">Important Disclaimer</h3>
              <p className="text-sm text-yellow-700 leading-relaxed">
                These transcripts are provided for transparency and public interest. The statements made
                by Ghislaine Maxwell during these proffer sessions are her own claims and have not been
                independently verified. Being mentioned in these transcripts does not indicate wrongdoing
                by any individual. Many statements contain Maxwell&apos;s personal recollections and opinions
                which may not be accurate. This content is provided for informational purposes only.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
