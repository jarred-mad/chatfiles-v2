'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import SearchBar from '../ui/SearchBar';

const languages = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
];

// Extend Window interface for Google Translate
declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: {
        TranslateElement: new (options: {
          pageLanguage: string;
          includedLanguages: string;
          layout: number;
          autoDisplay: boolean;
        }, elementId: string) => void;
        InlineLayout?: { SIMPLE: number };
      };
    };
  }
}

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');

  // Check if a nav link is active
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // Initialize Google Translate
  useEffect(() => {
    // Add Google Translate script
    const addScript = () => {
      if (document.getElementById('google-translate-script')) return;

      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    };

    // Initialize Google Translate element
    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,es,fr,zh-CN,de,pt,ar,ru,ja,ko',
            layout: window.google.translate.InlineLayout?.SIMPLE || 0,
            autoDisplay: false,
          },
          'google_translate_element'
        );
      }
    };

    addScript();
  }, []);

  // Function to trigger Google Translate
  const translatePage = (langCode: string) => {
    setCurrentLang(langCode);
    setLangMenuOpen(false);

    // Map our language codes to Google Translate codes
    const googleLangMap: Record<string, string> = {
      'en': 'en',
      'de': 'de',
      'es': 'es',
      'fr': 'fr',
      'zh': 'zh-CN',
    };

    const googleLang = googleLangMap[langCode] || langCode;

    // Find and click the Google Translate dropdown
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (select) {
      select.value = googleLang;
      select.dispatchEvent(new Event('change'));
    }
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/search', label: 'Search' },
    { href: '/people', label: 'People' },
    { href: '/browse', label: 'Docs' },
    { href: '/photos', label: 'Photos' },
    { href: '/videos', label: 'Vids', highlight: true },
    { href: '/audio', label: 'Audio', highlight: true },
    { href: '/articles', label: 'Articles' },
    { href: '/creators', label: 'Creator', highlight: true },
    { href: '/about', label: 'About' },
  ];

  return (
    <header className="bg-navy text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/images/logo.png"
              alt="ChatFiles.org"
              width={140}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors text-sm font-medium ${
                  isActive(link.href)
                    ? 'text-white bg-white/20 px-3 py-1 rounded'
                    : 'highlight' in link && link.highlight
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
                    onClick={() => translatePage(lang.code)}
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
                    onClick={() => translatePage(lang.code)}
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
                  className={`transition-colors py-2 px-2 rounded ${
                    isActive(link.href)
                      ? 'text-white bg-white/20 font-medium'
                      : 'text-gray-300 hover:text-white hover:bg-navy-light'
                  }`}
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
