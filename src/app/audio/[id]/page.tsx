import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { promises as fs } from 'fs';
import path from 'path';
import CommentSection from '@/components/ui/CommentSection';

interface PageProps {
  params: Promise<{ id: string }>;
}

// Transcript metadata
const TRANSCRIPT_META: Record<string, {
  title: string;
  date: string;
  day: number;
  part: number;
  description: string;
  participants: string[];
  keyTopics: string[];
}> = {
  'day-1-part-1': {
    title: 'Day 1 - Part 1 - Opening',
    date: 'Thursday, July 24, 2025',
    day: 1,
    part: 1,
    description: 'Opening of the proffer session. Introduction of participants and explanation of the proffer agreement.',
    participants: ['Ghislaine Maxwell', 'DOJ Representatives'],
    keyTopics: ['Proffer agreement', 'Session introduction'],
  },
  'day-1-part-2': {
    title: 'Day 1 - Part 2',
    date: 'Thursday, July 24, 2025',
    day: 1,
    part: 2,
    description: 'Detailed discussion of how Maxwell met Epstein, her father Robert Maxwell, and the early years of her relationship with Epstein.',
    participants: ['Ghislaine Maxwell', 'Spencer R. Horn (FBI)', 'Todd Blanchard (DOJ)', 'David Oscar Marcus (Defense)'],
    keyTopics: ['Meeting Epstein', 'Robert Maxwell', 'Bear Stearns connection', 'Donald Trump mention', 'Eva Andersson-Dubin', 'Leslie Wexner', 'New Mexico ranch', 'Island purchase', 'Bill Clinton', 'Ted Waite'],
  },
  'day-1-part-3': {
    title: 'Day 1 - Part 3',
    date: 'Thursday, July 24, 2025',
    day: 1,
    part: 3,
    description: 'Continued discussion of relationships, properties, and notable individuals.',
    participants: ['Ghislaine Maxwell', 'Spencer R. Horn (FBI)', 'DOJ Representatives'],
    keyTopics: ['Properties', 'Notable individuals', 'Flight logs'],
  },
  'day-1-part-4': {
    title: 'Day 1 - Part 4',
    date: 'Thursday, July 24, 2025',
    day: 1,
    part: 4,
    description: 'Brief session continuation.',
    participants: ['Ghislaine Maxwell', 'Spencer R. Horn (FBI)', 'DOJ Representatives'],
    keyTopics: ['Session continuation'],
  },
  'day-1-part-5': {
    title: 'Day 1 - Part 5',
    date: 'Thursday, July 24, 2025',
    day: 1,
    part: 5,
    description: 'Extended discussion continuing Day 1 topics.',
    participants: ['Ghislaine Maxwell', 'Spencer R. Horn (FBI)', 'DOJ Representatives'],
    keyTopics: ['Continued testimony'],
  },
  'day-1-part-6': {
    title: 'Day 1 - Part 6',
    date: 'Thursday, July 24, 2025',
    day: 1,
    part: 6,
    description: 'Continued discussion from Day 1.',
    participants: ['Ghislaine Maxwell', 'Spencer R. Horn (FBI)', 'DOJ Representatives'],
    keyTopics: ['Continued testimony'],
  },
  'day-1-part-7': {
    title: 'Day 1 - Part 7',
    date: 'Thursday, July 24, 2025',
    day: 1,
    part: 7,
    description: 'Final session of Day 1.',
    participants: ['Ghislaine Maxwell', 'Spencer R. Horn (FBI)', 'DOJ Representatives'],
    keyTopics: ['Day 1 conclusion'],
  },
  'day-2-part-1': {
    title: 'Day 2 - Part 1',
    date: 'Friday, July 25, 2025',
    day: 2,
    part: 1,
    description: 'Second day continuation. Discusses financial matters, $30 million in payments, relationships with Elon Musk, Bill Clinton, Hillary Clinton, Robert F. Kennedy Jr., and many others.',
    participants: ['Ghislaine Maxwell', 'Spencer R. Horn (FBI)', 'DOJ Representatives'],
    keyTopics: ['$30 million payments', 'Financial relationship with Epstein', 'Elon Musk', 'Sergey Brin', 'Bill Clinton', 'Hillary Clinton', 'Robert F. Kennedy Jr.', 'Andrew Cuomo', 'Chris Cuomo', 'John Kerry', 'Ted Kennedy', 'Cheryl Mills', 'Doug Band', 'Chris Tucker', 'Kevin Spacey', 'Naomi Campbell', 'Larry Summers', 'George Soros', 'Richard Branson', 'Sarah Ferguson', 'Leslie Wexner', 'Harvard/MIT connections', 'Marvin Minsky'],
  },
  'day-2-part-2': {
    title: 'Day 2 - Part 2',
    date: 'Friday, July 25, 2025',
    day: 2,
    part: 2,
    description: 'Continued discussion from Day 2.',
    participants: ['Ghislaine Maxwell', 'Spencer R. Horn (FBI)', 'DOJ Representatives'],
    keyTopics: ['Continued testimony'],
  },
  'day-2-part-3': {
    title: 'Day 2 - Part 3',
    date: 'Friday, July 25, 2025',
    day: 2,
    part: 3,
    description: 'Brief session from Day 2.',
    participants: ['Ghislaine Maxwell', 'Spencer R. Horn (FBI)', 'DOJ Representatives'],
    keyTopics: ['Session continuation'],
  },
  'day-2-part-4': {
    title: 'Day 2 - Part 4',
    date: 'Friday, July 25, 2025',
    day: 2,
    part: 4,
    description: 'Final session of Day 2.',
    participants: ['Ghislaine Maxwell', 'Spencer R. Horn (FBI)', 'DOJ Representatives'],
    keyTopics: ['Day 2 conclusion'],
  },
};

// Map file names to IDs (underscores instead of spaces for Vercel compatibility)
const FILE_MAP: Record<string, string> = {
  'day-1-part-1': 'Day_1_-_Part_1_-_7_24_25_Tallahassee.003_(transcript).wav.pdf.txt',
  'day-1-part-2': 'Day_1_-_Part_2_-_7_24_25_Tallahassee.004_(transcript).wav.pdf.txt',
  'day-1-part-3': 'Day_1_-_Part_3_-_7_24_25_Tallahassee.005_(R)_(transcript).wav.pdf.txt',
  'day-1-part-4': 'Day_1_-_Part_4_-_7_24_25_Tallahassee.007_(transcript).wav.pdf.txt',
  'day-1-part-5': 'Day_1_-_Part_5_-_7_24_25_Tallahassee.008_(R)_(transcript).wav.pdf.txt',
  'day-1-part-6': 'Day_1_-_Part_6_-_7_24_25_Tallahassee.009_(R)_(transcript).wav.pdf.txt',
  'day-1-part-7': 'Day_1_-_Part_7_-_7_24_25_Tallahassee.010_(transcript).wav.pdf.txt',
  'day-2-part-1': 'Day_2_-_Part_1_-_2025.07.25_-_xxx7_25.003_(R)_(transcript).wav.pdf.txt',
  'day-2-part-2': 'Day_2_-_Part_2_-_2025.07.25_-_xxx7_25.004_(R)_(transcript).wav.pdf.txt',
  'day-2-part-3': 'Day_2_-_Part_3_-_2025.07.25_-_xxx7_25.005_(transcript).wav.pdf.txt',
  'day-2-part-4': 'Day_2_-_Part_4_-_2025.07.25_-_xxx7_25.006_(R)_(transcript).wav.pdf.txt',
};

// Audio file URLs on R2
const R2_BASE = 'https://pub-e8b8792b476a4216b2cbd491f9d61af0.r2.dev';
const AUDIO_MAP: Record<string, string> = {
  'day-1-part-1': `${R2_BASE}/audio/Day_1_-_Part_1_-_7_24_25_Tallahassee.003.wav`,
  'day-1-part-2': `${R2_BASE}/audio/Day_1_-_Part_2_-_7_24_25_Tallahassee.004.wav`,
  'day-1-part-3': `${R2_BASE}/audio/Day_1_-_Part_3_-_7_24_25_Tallahassee.005_(R).wav`,
  'day-1-part-4': `${R2_BASE}/audio/Day_1_-_Part_4_-_7_24_25_Tallahassee.007.wav`,
  'day-1-part-5': `${R2_BASE}/audio/Day_1_-_Part_5_-_7_24_25_Tallahassee.008_(R).wav`,
  'day-1-part-6': `${R2_BASE}/audio/Day_1_-_Part_6_-_7_24_25_Tallahassee.009_(R).wav`,
  'day-1-part-7': `${R2_BASE}/audio/Day_1_-_Part_7_-_7_24_25_Tallahassee.010.wav`,
  'day-2-part-1': `${R2_BASE}/audio/Day_2_-_Part_1_-_2025.07.25_-_xxx7_25.003_(R).wav`,
  'day-2-part-2': `${R2_BASE}/audio/Day_2_-_Part_2_-_2025.07.25_-_xxx7_25.004_(R).wav`,
  'day-2-part-3': `${R2_BASE}/audio/Day_2_-_Part_3_-_2025.07.25_-_xxx7_25.005.wav`,
  'day-2-part-4': `${R2_BASE}/audio/Day_2_-_Part_4_-_2025.07.25_-_xxx7_25.006_(R).wav`,
};

async function getTranscript(id: string): Promise<string | null> {
  const filename = FILE_MAP[id];
  if (!filename) return null;

  try {
    // Read directly from filesystem (works in Next.js server components)
    const filePath = path.join(process.cwd(), 'public', 'transcripts', filename);
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error('Error reading transcript:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const meta = TRANSCRIPT_META[id];

  if (!meta) {
    return { title: 'Transcript Not Found' };
  }

  return {
    title: `${meta.title} | Maxwell Proffer Transcript`,
    description: meta.description,
    openGraph: {
      title: `${meta.title} - Maxwell Proffer Session`,
      description: meta.description,
    },
  };
}

export default async function TranscriptPage({ params }: PageProps) {
  const { id } = await params;
  const meta = TRANSCRIPT_META[id];

  if (!meta) {
    notFound();
  }

  const transcript = await getTranscript(id);
  const audioUrl = AUDIO_MAP[id];

  // Get prev/next links
  const allIds = Object.keys(FILE_MAP);
  const currentIndex = allIds.indexOf(id);
  const prevId = currentIndex > 0 ? allIds[currentIndex - 1] : null;
  const nextId = currentIndex < allIds.length - 1 ? allIds[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/audio" className="text-gray-400 hover:text-white text-sm mb-4 inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Audio
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold mt-2">{meta.title}</h1>
          <p className="text-gray-300 mt-2">{meta.date}</p>
        </div>
      </div>

      {/* Ad Banner */}

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Meta Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-3">Session Details</h2>
          <p className="text-gray-600 mb-4">{meta.description}</p>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Participants</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                {meta.participants.map((p) => (
                  <li key={p} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-navy rounded-full"></span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Key Topics</h3>
              <div className="flex flex-wrap gap-1">
                {meta.keyTopics.slice(0, 8).map((topic) => (
                  <span key={topic} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {topic}
                  </span>
                ))}
                {meta.keyTopics.length > 8 && (
                  <span className="text-xs text-gray-400">+{meta.keyTopics.length - 8} more</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Audio Player */}
        {audioUrl && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 0112.728 0" />
                </svg>
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Listen to Recording</h2>
                <p className="text-sm text-gray-500">Original audio from the proffer session</p>
              </div>
            </div>
            <audio
              controls
              className="w-full"
              preload="metadata"
            >
              <source src={audioUrl} type="audio/wav" />
              Your browser does not support the audio element.
            </audio>
            <div className="mt-3 flex items-center justify-between text-sm">
              <a
                href={audioUrl}
                download
                className="text-accent hover:text-accent-hover flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Audio
              </a>
              <span className="text-gray-400">WAV format</span>
            </div>
          </div>
        )}

        {/* Transcript */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
            <h2 className="font-bold text-gray-900">Full Transcript</h2>
          </div>
          <div className="p-6">
            {transcript ? (
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed text-sm">
                  {transcript}
                </pre>
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 mb-4">Transcript file not found.</p>
                <p className="text-sm text-gray-400">
                  The transcript for this session is being processed.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          {prevId ? (
            <Link
              href={`/audio/${prevId}`}
              className="flex items-center gap-2 text-accent hover:text-accent-hover"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous Part
            </Link>
          ) : (
            <div></div>
          )}
          {nextId ? (
            <Link
              href={`/audio/${nextId}`}
              className="flex items-center gap-2 text-accent hover:text-accent-hover"
            >
              Next Part
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <div></div>
          )}
        </div>

        {/* Comments Section */}
        <CommentSection pageType="audio" pageId={id} />

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          <strong>Disclaimer:</strong> This transcript contains statements made by Ghislaine Maxwell
          which have not been independently verified. Being mentioned does not indicate wrongdoing.
        </div>
      </div>
    </div>
  );
}
