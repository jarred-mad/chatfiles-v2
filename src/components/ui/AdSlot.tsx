'use client';

import { useEffect, useRef, useState } from 'react';

type AdSize = 'leaderboard' | 'sidebar' | 'incontent' | 'mobile-banner' | 'large-rectangle' | 'billboard';

interface AdSlotProps {
  size: AdSize;
  id: string;
  className?: string;
}

const AD_DIMENSIONS: Record<AdSize, { width: number; height: number; label: string; mobileOnly?: boolean; desktopOnly?: boolean }> = {
  leaderboard: { width: 728, height: 90, label: 'Leaderboard 728x90', desktopOnly: true },
  billboard: { width: 970, height: 250, label: 'Billboard 970x250', desktopOnly: true },
  sidebar: { width: 300, height: 250, label: 'Medium Rectangle 300x250' },
  'large-rectangle': { width: 336, height: 280, label: 'Large Rectangle 336x280' },
  incontent: { width: 300, height: 250, label: 'In-Content 300x250' },
  'mobile-banner': { width: 320, height: 100, label: 'Mobile Banner 320x100', mobileOnly: true },
};

export default function AdSlot({ size, id, className = '' }: AdSlotProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const dimensions = AD_DIMENSIONS[size];

  // Lazy load - only show when in viewport
  useEffect(() => {
    if (!adRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    observer.observe(adRef.current);
    return () => observer.disconnect();
  }, []);

  // Load AdSense script when visible
  useEffect(() => {
    if (!isVisible) return;

    try {
      // @ts-expect-error - AdSense global
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense may not be loaded yet
    }
  }, [isVisible]);

  const responsiveClasses = dimensions.mobileOnly
    ? 'block md:hidden'
    : dimensions.desktopOnly
    ? 'hidden md:block'
    : '';

  return (
    <div
      ref={adRef}
      className={`ad-container ${responsiveClasses} ${className}`}
      style={{ minHeight: dimensions.height }}
    >
      {isVisible ? (
        <>
          {/* AdSense ad unit - replace data-ad-client with your publisher ID */}
          <ins
            className="adsbygoogle"
            style={{
              display: 'block',
              width: '100%',
              maxWidth: dimensions.width,
              height: dimensions.height,
              margin: '0 auto'
            }}
            data-ad-client="ca-pub-5314062114057461"
            data-ad-slot={id}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
          {/* Placeholder shown until AdSense loads */}
          <div
            className="ad-placeholder flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-dashed border-gray-300 rounded-lg"
            style={{
              width: '100%',
              maxWidth: dimensions.width,
              height: dimensions.height,
              margin: '0 auto'
            }}
          >
            <div className="text-center">
              <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">Advertisement</div>
              <div className="text-gray-500 text-sm font-medium">{dimensions.label}</div>
            </div>
          </div>
        </>
      ) : (
        <div
          className="bg-gray-100 animate-pulse rounded-lg"
          style={{
            width: '100%',
            maxWidth: dimensions.width,
            height: dimensions.height,
            margin: '0 auto'
          }}
        />
      )}
    </div>
  );
}

// Sticky sidebar ad wrapper
export function StickySidebarAd({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky top-4">
      {children}
    </div>
  );
}

// Ad banner between content sections
export function AdBanner({ id, className = '' }: { id: string; className?: string }) {
  return (
    <div className={`my-6 ${className}`}>
      <div className="hidden md:block">
        <AdSlot size="leaderboard" id={id} className="mx-auto" />
      </div>
      <div className="block md:hidden">
        <AdSlot size="mobile-banner" id={id} className="mx-auto" />
      </div>
    </div>
  );
}
