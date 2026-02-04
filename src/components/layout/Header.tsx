'use client';

import Link from 'next/link';
import { useState } from 'react';
import SearchBar from '../ui/SearchBar';

const languages = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/search', label: 'Search' },
    { href: '/people', label: 'People' },
    { href: '/browse', label: 'Documents' },
    { href: '/photos', label: 'Photos' },
    { href: '/videos', label: 'Videos' },
    { href: '/articles', label: 'Articles', highlight: true },
    { href: '/about', label: 'About' },
  ];

  return (
    <header className="bg-navy text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">ChatFiles.org</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors text-sm font-medium ${
                  'highlight' in link && link.highlight
                    ? 'text-yellow-400 hover:text-yellow-300'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Language Selector */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-navy-light transition-colors text-sm"
            >
              <span>{languages.find(l => l.code === currentLang)?.flag}</span>
              <span className="text-gray-300">{languages.find(l => l.code === currentLang)?.code.toUpperCase()}</span>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {langMenuOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg py-1 z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setCurrentLang(lang.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 ${
                      currentLang === lang.code ? 'bg-gray-50 text-navy font-medium' : 'text-gray-700'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Search */}
          <div className="hidden md:block w-64 lg:w-80">
            <SearchBar compact />
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-navy-light"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-navy-light">
            <div className="mb-4">
              <SearchBar />
            </div>
            {/* Mobile Language Selector */}
            <div className="flex items-center gap-2 mb-4 px-2">
              <span className="text-gray-400 text-sm">Language:</span>
              <div className="flex gap-1">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setCurrentLang(lang.code)}
                    className={`px-2 py-1 rounded text-sm ${
                      currentLang === lang.code
                        ? 'bg-white text-navy font-medium'
                        : 'text-gray-300 hover:bg-navy-light'
                    }`}
                  >
                    {lang.flag}
                  </button>
                ))}
              </div>
            </div>
            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-300 hover:text-white transition-colors py-2 px-2 rounded hover:bg-navy-light"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* Tagline bar */}
      <div className="bg-navy-dark py-1 text-center text-xs text-gray-400 hidden sm:block">
        Searchable Archive of the DOJ Epstein Files
      </div>
    </header>
  );
}
