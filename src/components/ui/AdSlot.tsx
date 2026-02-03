'use client';

import { useEffect, useRef, useState } from 'react';

type AdSize = 'leaderboard' | 'sidebar' | 'incontent' | 'mobile-banner';

interface AdSlotProps {
  size: AdSize;
  id: string;
  className?: string;
}

const AD_DIMENSIONS: Record<AdSize, { width: number; height: number; mobileOnly?: boolean; desktopOnly?: boolean }> = {
  leaderboard: { width: 728, height: 90, desktopOnly: true },
  sidebar: { width: 300, height: 250, desktopOnly: true },
  incontent: { width: 300, height: 250 },
  'mobile-banner': { width: 320, height: 50, mobileOnly: true },
};

export default function AdSlot({ size, id, className = '' }: AdSlotProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDev] = useState(process.env.NODE_ENV === 'development');

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
    if (!isVisible || isDev) return;

    try {
      // @ts-expect-error - AdSense global
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense may not be loaded
    }
  }, [isVisible, isDev]);

  const responsiveClasses = dimensions.mobileOnly
    ? 'block md:hidden'
    : dimensions.desktopOnly
    ? 'hidden md:block'
    : '';

  return (
    <div
      ref={adRef}
      className={`${responsiveClasses} ${className}`}
      style={{ minHeight: dimensions.height }}
    >
      {isDev ? (
        // Development placeholder
        <div
          className="ad-placeholder rounded"
          style={{ width: dimensions.width, height: dimensions.height, maxWidth: '100%' }}
        >
          Ad: {size} ({dimensions.width}x{dimensions.height})
        </div>
      ) : isVisible ? (
        // Production AdSense
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: dimensions.width, height: dimensions.height }}
          data-ad-client="ca-pub-XXXXXXXXXX" // Replace with actual AdSense ID
          data-ad-slot={id}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        // Loading placeholder
        <div
          className="bg-gray-100 animate-pulse rounded"
          style={{ width: dimensions.width, height: dimensions.height, maxWidth: '100%' }}
        />
      )}
    </div>
  );
}
