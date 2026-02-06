"use client";

import { useState } from "react";
import Link from "next/link";
import { notableNames, categories } from "@/lib/notable-names";

const R2_URL = "https://pub-e8b8792b476a4216b2cbd491f9d61af0.r2.dev";

// Map person names to their photo filenames (handles special cases)
const PHOTO_MAP: Record<string, string> = {
  "Jean-Luc Brunel": "Jean-Luc_Brunel_2001.jpg",
  "Leon Black": "Leon _Black.jpg",
  "Nadia Marcinkova": "Nadia_Marcinko.jpg",
  "Dr. Mehmet Oz": "Mehmet_Oz.jpg",
  "Mortimer Zuckerman": "Mort_Zuckerman.jpg",
};

function getPhotoUrl(name: string): string {
  // Check special cases first
  if (PHOTO_MAP[name]) {
    return `${R2_URL}/people/${PHOTO_MAP[name]}`;
  }
  // Convert name to filename format: "Bill Clinton" -> "Bill_Clinton.jpg"
  const filename = name.replace(/\s+/g, '_').replace(/[.]/g, '') + '.jpg';
  return `${R2_URL}/people/${filename}`;
}

// Group by category
const byCategory = categories.map(cat => ({
  ...cat,
  people: notableNames.filter(p => p.category === cat.id).sort((a, b) => a.rank - b.rank),
})).filter(cat => cat.people.length > 0);

export default function PeoplePage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Filter people based on selected category
  const filteredCategories = activeCategory
    ? byCategory.filter(cat => cat.id === activeCategory)
    : byCategory;

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
            Click any name to view their profile and related documents.
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

      {/* Top Ad Banner */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Category Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-8">
          {/* All button */}
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeCategory === null
                ? "bg-navy text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            All ({notableNames.length})
          </button>
          {byCategory.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? "ring-2 ring-offset-2 ring-gray-400"
                  : "hover:opacity-80"
              }`}
              style={{
                backgroundColor: cat.color,
                color: "white"
              }}
            >
              {cat.label} ({cat.people.length})
            </button>
          ))}
        </div>

        {/* Names Grid by Category */}
        {filteredCategories.map((cat, catIndex) => (
          <>
            {/* Show ad after every 3 categories */}
            {catIndex > 0 && catIndex % 3 === 0 && (
            )}
          <section key={cat.id} className="mb-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></span>
              {cat.label}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cat.people.map(person => (
                <Link
                  key={person.name}
                  href={`/people/${person.slug}`}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md hover:border-accent transition-all group"
                >
                  <div className="flex items-center gap-3">
                    {/* Photo */}
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                      <img
                        src={getPhotoUrl(person.name)}
                        alt={person.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Hide broken images
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 group-hover:text-accent transition-colors truncate">
                        {person.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                        {person.description}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-accent transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </section>
          </>
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
