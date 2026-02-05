'use client';

import { useEffect, useRef, useState } from 'react';

// Generate unique ID for each ad instance
let adCounter = 0;
const getAdId = () => `ad-${++adCounter}-${Date.now()}`;

// Default AdSlot - returns null (no generic ads)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function AdSlot({ className = '' }: { className?: string }) {
  return null;
}

// AdBanner - shows leaderboard on desktop, mobile banner on mobile
export function AdBanner({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <div className="hidden md:flex justify-center">
        <LeaderboardAd />
      </div>
      <div className="flex md:hidden justify-center">
        <MobileBannerAd />
      </div>
    </div>
  );
}

// InContentAd - returns null until we have a code
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function InContentAd({ className = '' }: { className?: string }) {
  return null;
}

// 728x90 Leaderboard display ad
export function LeaderboardAd({ className = '' }: { className?: string }) {
  const adRef = useRef<HTMLDivElement>(null);
  const [adId] = useState(() => getAdId());

  useEffect(() => {
    if (!adRef.current || adRef.current.querySelector('script')) return;

    const container = adRef.current;

    // Create script with unique options
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.innerHTML = `
      atOptions = {
        'key' : 'a93a7e8aeab3342ce1628214611315f8',
        'format' : 'iframe',
        'height' : 90,
        'width' : 728,
        'params' : {}
      };
    `;
    container.appendChild(script);

    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = 'https://www.highperformanceformat.com/a93a7e8aeab3342ce1628214611315f8/invoke.js';
    container.appendChild(invokeScript);
  }, [adId]);

  return (
    <div ref={adRef} id={adId} className={`ad-container ${className}`} style={{ width: 728, minHeight: 90 }}>
    </div>
  );
}

// 300x250 Sidebar display ad
export function SidebarAd({ className = '' }: { className?: string }) {
  const adRef = useRef<HTMLDivElement>(null);
  const [adId] = useState(() => getAdId());

  useEffect(() => {
    if (!adRef.current || adRef.current.querySelector('script')) return;

    const container = adRef.current;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.innerHTML = `
      atOptions = {
        'key' : '6ea2a3d08ec0f485f70f464045a48a80',
        'format' : 'iframe',
        'height' : 250,
        'width' : 300,
        'params' : {}
      };
    `;
    container.appendChild(script);

    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = 'https://www.highperformanceformat.com/6ea2a3d08ec0f485f70f464045a48a80/invoke.js';
    container.appendChild(invokeScript);
  }, [adId]);

  return (
    <div ref={adRef} id={adId} className={`ad-container ${className}`} style={{ width: 300, minHeight: 250 }}>
    </div>
  );
}

// 160x300 Skyscraper display ad
export function SkyscraperAd({ className = '' }: { className?: string }) {
  const adRef = useRef<HTMLDivElement>(null);
  const [adId] = useState(() => getAdId());

  useEffect(() => {
    if (!adRef.current || adRef.current.querySelector('script')) return;

    const container = adRef.current;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.innerHTML = `
      atOptions = {
        'key' : 'b4f0e68ec325d0e8ae6160bd9cb72d26',
        'format' : 'iframe',
        'height' : 300,
        'width' : 160,
        'params' : {}
      };
    `;
    container.appendChild(script);

    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = 'https://www.highperformanceformat.com/b4f0e68ec325d0e8ae6160bd9cb72d26/invoke.js';
    container.appendChild(invokeScript);
  }, [adId]);

  return (
    <div ref={adRef} id={adId} className={`ad-container ${className}`} style={{ width: 160, minHeight: 300 }}>
    </div>
  );
}

// 160x600 Wide Skyscraper display ad
export function WideSkyscraperAd({ className = '' }: { className?: string }) {
  const adRef = useRef<HTMLDivElement>(null);
  const [adId] = useState(() => getAdId());

  useEffect(() => {
    if (!adRef.current || adRef.current.querySelector('script')) return;

    const container = adRef.current;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.innerHTML = `
      atOptions = {
        'key' : '36179abb943aa71a84f3df1312de97d4',
        'format' : 'iframe',
        'height' : 600,
        'width' : 160,
        'params' : {}
      };
    `;
    container.appendChild(script);

    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = 'https://www.highperformanceformat.com/36179abb943aa71a84f3df1312de97d4/invoke.js';
    container.appendChild(invokeScript);
  }, [adId]);

  return (
    <div ref={adRef} id={adId} className={`ad-container ${className}`} style={{ width: 160, minHeight: 600 }}>
    </div>
  );
}

// 320x50 Mobile banner ad
export function MobileBannerAd({ className = '' }: { className?: string }) {
  const adRef = useRef<HTMLDivElement>(null);
  const [adId] = useState(() => getAdId());

  useEffect(() => {
    if (!adRef.current || adRef.current.querySelector('script')) return;

    const container = adRef.current;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.innerHTML = `
      atOptions = {
        'key' : '268ccc0aa6d01fd38fcf6d1521f57c7f',
        'format' : 'iframe',
        'height' : 50,
        'width' : 320,
        'params' : {}
      };
    `;
    container.appendChild(script);

    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = 'https://www.highperformanceformat.com/268ccc0aa6d01fd38fcf6d1521f57c7f/invoke.js';
    container.appendChild(invokeScript);
  }, [adId]);

  return (
    <div ref={adRef} id={adId} className={`ad-container ${className}`} style={{ width: 320, minHeight: 50 }}>
    </div>
  );
}
