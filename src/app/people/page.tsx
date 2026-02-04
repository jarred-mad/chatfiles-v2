import Link from "next/link";
import { Metadata } from "next";
import { notableNames, categories } from "@/lib/notable-names";

export const metadata: Metadata = {
  title: "100 Notable Names in the Epstein Files | ChatFiles.org",
  description: "Comprehensive list of 100 notable individuals mentioned in the DOJ Epstein Files releases. Searchable database of public records.",
};

export default function PeoplePage() {
  // Group by category for the sidebar
  const byCategory = categories.map(cat => ({
    ...cat,
    people: notableNames.filter(p => p.category === cat.id).sort((a, b) => a.rank - b.rank),
  })).filter(cat => cat.people.length > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-navy text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            100 Notable Names in the Epstein Files
          </h1>
          <p className="text-gray-300 max-w-3xl">
            Compiled from DOJ releases under the Epstein Files Transparency Act (Dec 2025 – Jan 2026).
            Click any name to search for related documents.
          </p>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-amber-800">
              <strong>Important Disclaimer:</strong> Being mentioned in these files does not indicate wrongdoing.
              Names appear in a wide range of contexts including photos, contact books, third-party emails,
              unverified FBI tips, flight logs, and social correspondence. None of the individuals listed
              have been charged with crimes connected to the Epstein investigation (aside from Ghislaine Maxwell).
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {byCategory.map(cat => (
            <a
              key={cat.id}
              href={`#${cat.id.toLowerCase().replace(/\s+/g, '-')}`}
              className="px-3 py-1.5 rounded-full text-white text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ backgroundColor: cat.color }}
            >
              {cat.label} ({cat.people.length})
            </a>
          ))}
        </div>

        {/* Names Grid by Category */}
        {byCategory.map(cat => (
          <section key={cat.id} id={cat.id.toLowerCase().replace(/\s+/g, '-')} className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></span>
              {cat.label}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cat.people.map(person => (
                <Link
                  key={person.name}
                  href={`/search?q=${encodeURIComponent(person.name)}`}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md hover:border-accent transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-accent transition-colors">
                        {person.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {person.description}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-accent transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}

        {/* Sources */}
        <section className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Sources</h2>
          <p className="text-sm text-gray-600">
            DOJ Epstein Files releases (Dec 19, 2025 & Jan 30, 2026), House Oversight Committee releases,
            Associated Press, CBS News, PBS, NPR, CNN, BBC, Al Jazeera, Wikipedia, and others.
            Journalists are still reviewing 3.5+ million pages; additional names and context may emerge.
          </p>
        </section>
      </div>
    </div>
  );
}
