'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface SearchBarProps {
  compact?: boolean;
  initialQuery?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function SearchBar({
  compact = false,
  initialQuery = '',
  placeholder = 'Search documents...',
  autoFocus = false,
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounced fetch suggestions
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
        }
      } catch {
        // Silently fail on suggestion errors
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        setShowSuggestions(false);
      }
    },
    [query, router]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        handleSubmit();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          setQuery(suggestions[selectedIndex]);
          setShowSuggestions(false);
          router.push(`/search?q=${encodeURIComponent(suggestions[selectedIndex])}`);
        } else {
          handleSubmit();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
              setSelectedIndex(-1);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className={`
              w-full rounded-lg border border-gray-300 bg-white text-gray-900
              focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none
              transition-all
              ${compact ? 'py-2 pl-4 pr-10 text-sm' : 'py-3 pl-5 pr-12 text-base'}
            `}
          />
          <button
            type="submit"
            className={`
              absolute right-0 top-0 h-full flex items-center justify-center
              text-gray-400 hover:text-accent transition-colors
              ${compact ? 'px-3' : 'px-4'}
            `}
            aria-label="Search"
          >
            <svg
              className={compact ? 'w-4 h-4' : 'w-5 h-5'}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              onClick={() => {
                setQuery(suggestion);
                setShowSuggestions(false);
                router.push(`/search?q=${encodeURIComponent(suggestion)}`);
              }}
              className={`
                w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors
                ${index === selectedIndex ? 'bg-gray-100' : ''}
              `}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
