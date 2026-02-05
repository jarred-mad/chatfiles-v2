// Build trigger: 2026-02-04-creators-v3
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { notableNames, NotablePerson } from '@/lib/notable-names';
import { AdBanner } from '@/components/ui/AdSlot';

interface ScriptResult {
  script: string;
  wordCount: number;
  estimatedDuration: string;
  sources: string[];
  hooks: string[];
  callToAction: string;
}

const DURATION_OPTIONS = [
  { value: 30, label: '30 seconds', words: '75-90 words', platform: 'TikTok/Reels' },
  { value: 60, label: '1 minute', words: '150-180 words', platform: 'YouTube Shorts' },
  { value: 120, label: '2 minutes', words: '300-360 words', platform: 'Short video' },
  { value: 300, label: '5 minutes', words: '750-900 words', platform: 'YouTube/Podcast' },
];

const TONE_OPTIONS = [
  { value: 'investigative', label: 'Investigative', description: 'Serious, fact-focused journalism style' },
  { value: 'educational', label: 'Educational', description: 'Informative, explaining context and connections' },
  { value: 'dramatic', label: 'Dramatic', description: 'Engaging storytelling with tension' },
  { value: 'neutral', label: 'Neutral', description: 'Balanced, objective reporting' },
];

// Keywords/topics that creators can search for with a person
const SEARCH_TOPICS = [
  { keyword: 'flight logs', icon: '✈️', description: 'Travel records and Lolita Express' },
  { keyword: 'island', icon: '🏝️', description: 'Little St. James references' },
  { keyword: 'mansion', icon: '🏠', description: 'NYC townhouse or Palm Beach' },
  { keyword: 'black book', icon: '📒', description: 'Contact book entries' },
  { keyword: 'email', icon: '📧', description: 'Email correspondence' },
  { keyword: 'photo', icon: '📸', description: 'Photographs and images' },
  { keyword: 'deposition', icon: '⚖️', description: 'Legal testimony' },
  { keyword: 'FBI', icon: '🔍', description: 'FBI investigation files' },
  { keyword: 'massage', icon: '💆', description: 'Massage-related mentions' },
  { keyword: 'money', icon: '💰', description: 'Financial transactions' },
  { keyword: 'donation', icon: '🎁', description: 'Charitable donations' },
  { keyword: 'dinner', icon: '🍽️', description: 'Social events and dinners' },
  { keyword: 'party', icon: '🎉', description: 'Party and event mentions' },
  { keyword: 'meeting', icon: '🤝', description: 'Scheduled meetings' },
  { keyword: 'phone', icon: '📞', description: 'Phone records and calls' },
  { keyword: 'victim', icon: '👤', description: 'Victim statements' },
  { keyword: 'witness', icon: '👁️', description: 'Witness testimony' },
  { keyword: 'Maxwell', icon: '👩', description: 'Ghislaine Maxwell connections' },
];

export default function CreatorsPage() {
  const [selectedPerson, setSelectedPerson] = useState<NotablePerson | null>(null);
  const [duration, setDuration] = useState(60);
  const [tone, setTone] = useState('investigative');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [script, setScript] = useState<ScriptResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [documentCount, setDocumentCount] = useState<number>(0);

  // Filter notable names based on search
  const filteredNames = notableNames.filter(person =>
    person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch document count when person is selected
  useEffect(() => {
    if (selectedPerson) {
      fetch(`/api/search?q=${encodeURIComponent(selectedPerson.name)}&limit=1`)
        .then(res => res.json())
        .then(data => setDocumentCount(data.total || 0))
        .catch(() => setDocumentCount(0));
    }
  }, [selectedPerson]);

  const generateScript = async () => {
    if (!selectedPerson) return;

    setIsGenerating(true);
    setError(null);
    setScript(null);

    try {
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personName: selectedPerson.name,
          personDescription: selectedPerson.description,
          category: selectedPerson.category,
          duration,
          tone,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate script');
      }

      const data = await response.json();
      setScript(data);
    } catch (err) {
      setError('Failed to generate script. Please try again.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-navy text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-2">Content Creator Script Generator</h1>
          <p className="text-gray-300">
            Generate video scripts based on the Epstein Files documents. Select a person, choose your format, and get a ready-to-use script.
          </p>
        </div>
      </div>

      {/* Ad Banner */}
      <AdBanner className="py-4 bg-gray-100" />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Main Content */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Configuration */}
            <div className="space-y-6">
              {/* Person Selection */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">1. Select a Person</h2>

                <input
                  type="text"
                  placeholder="Search names..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />

                <div className="max-h-64 overflow-y-auto border rounded-lg">
                  {filteredNames.slice(0, 50).map((person) => (
                    <button
                      key={person.slug}
                      onClick={() => {
                        setSelectedPerson(person);
                        setSearchQuery('');
                      }}
                      className={`w-full text-left px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 transition ${
                        selectedPerson?.slug === person.slug ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                    >
                      <div className="font-medium text-gray-900">{person.name}</div>
                      <div className="text-sm text-gray-500">{person.category}</div>
                    </button>
                  ))}
                </div>

                {selectedPerson && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <div className="font-semibold text-blue-900">{selectedPerson.name}</div>
                    <div className="text-sm text-blue-700">{selectedPerson.description}</div>
                    <div className="text-xs text-blue-600 mt-2">
                      Found in {documentCount.toLocaleString()} documents
                    </div>

                    {/* Quick Search Topics */}
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <div className="text-xs font-medium text-blue-800 mb-2">Quick Search Topics:</div>
                      <div className="flex flex-wrap gap-2">
                        {SEARCH_TOPICS.slice(0, 12).map((topic) => (
                          <Link
                            key={topic.keyword}
                            href={`/search?q=${encodeURIComponent(selectedPerson.name + ' ' + topic.keyword)}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 px-2 py-1 bg-white hover:bg-blue-100 border border-blue-200 rounded text-xs text-blue-700 transition-colors"
                            title={topic.description}
                          >
                            <span>{topic.icon}</span>
                            <span>{topic.keyword}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Research Topics - Only shown when person selected */}
              {selectedPerson && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold mb-2">Research Topics</h2>
                  <p className="text-sm text-gray-500 mb-4">
                    Click any topic to search for &quot;{selectedPerson.name}&quot; + that keyword
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {SEARCH_TOPICS.map((topic) => (
                      <Link
                        key={topic.keyword}
                        href={`/search?q=${encodeURIComponent(selectedPerson.name + ' ' + topic.keyword)}`}
                        target="_blank"
                        className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-colors group"
                      >
                        <span className="text-xl">{topic.icon}</span>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-800 group-hover:text-blue-700 text-sm capitalize">
                            {topic.keyword}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {topic.description}
                          </div>
                        </div>
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 ml-auto flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Link>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <Link
                      href={`/search?q=${encodeURIComponent(selectedPerson.name)}`}
                      target="_blank"
                      className="flex items-center justify-center gap-2 w-full py-2 bg-navy text-white rounded-lg hover:bg-navy-light transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      View All {documentCount} Documents for {selectedPerson.name.split(' ')[0]}
                    </Link>
                  </div>
                </div>
              )}

              {/* Duration Selection */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">{selectedPerson ? '2.' : '2.'} Choose Duration</h2>
                <div className="space-y-2">
                  {DURATION_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${
                        duration === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="duration"
                        value={option.value}
                        checked={duration === option.value}
                        onChange={() => setDuration(option.value)}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-gray-500">
                          {option.words} - Best for {option.platform}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tone Selection */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">3. Select Tone</h2>
                <div className="space-y-2">
                  {TONE_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${
                        tone === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="tone"
                        value={option.value}
                        checked={tone === option.value}
                        onChange={() => setTone(option.value)}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-gray-500">{option.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateScript}
                disabled={!selectedPerson || isGenerating}
                className={`w-full py-4 rounded-lg font-semibold text-white transition ${
                  !selectedPerson || isGenerating
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Script...
                  </span>
                ) : (
                  'Generate Script'
                )}
              </button>
            </div>

            {/* Right Column - Script Output */}
            <div>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
                  {error}
                </div>
              )}

              {script ? (
                <div className="bg-white rounded-lg shadow p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Your Script</h2>
                    <div className="text-sm text-gray-500">
                      {script.wordCount} words - {script.estimatedDuration}
                    </div>
                  </div>

                  {/* Hook Options */}
                  {script.hooks && script.hooks.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">Opening Hooks (choose one):</h3>
                      <div className="space-y-2">
                        {script.hooks.map((hook, index) => (
                          <div key={index} className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                            <span className="text-yellow-600 font-bold">{index + 1}.</span>
                            <p className="text-gray-800 flex-1">{hook}</p>
                            <button
                              onClick={() => copyToClipboard(hook)}
                              className="text-gray-400 hover:text-gray-600"
                              title="Copy hook"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Main Script */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-700">Main Script:</h3>
                      <button
                        onClick={() => copyToClipboard(script.script)}
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy Script
                      </button>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap text-gray-800 leading-relaxed">
                      {script.script}
                    </div>
                  </div>

                  {/* Call to Action */}
                  {script.callToAction && (
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">Suggested Call-to-Action:</h3>
                      <div className="p-3 bg-green-50 rounded-lg text-gray-800">
                        {script.callToAction}
                      </div>
                    </div>
                  )}

                  {/* Sources */}
                  {script.sources && script.sources.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">Source Documents:</h3>
                      <div className="flex flex-wrap gap-2">
                        {script.sources.map((source, index) => (
                          <Link
                            key={index}
                            href={`/documents/${source}`}
                            className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
                          >
                            {source}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Disclaimer */}
                  <div className="text-xs text-gray-500 border-t pt-4">
                    <strong>Disclaimer:</strong> This script is generated based on publicly available court documents.
                    Always verify facts independently before publishing. Being mentioned in these documents does not
                    imply wrongdoing. Use responsibly and ethically.
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Ready to Generate</h3>
                  <p className="text-gray-500">
                    Select a person and click &quot;Generate Script&quot; to create your video script.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Tips Section */}
          <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Tips for Content Creators</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Verify Everything</h3>
                <p className="text-sm text-gray-600">
                  Cross-reference all claims with the original documents. Link to ChatFiles.org so viewers can verify.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Stay Factual</h3>
                <p className="text-sm text-gray-600">
                  Stick to what the documents say. Avoid speculation and clearly distinguish facts from analysis.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Credit Sources</h3>
                <p className="text-sm text-gray-600">
                  Mention that these are court documents and provide document IDs for transparency.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
