'use client';

import { useEffect, useRef, useState } from 'react';

// Generate unique ID for each ad instance
let adCounter = 0;
const getAdId = () => `ad-${++adCounter}-${Date.now()}`;

// Default AdSlot
export default function AdSlot({ className = '', id: _id, size: _size }: { className?: string; id?: string; size?: string }) {
  return <LeaderboardAd className={className} />;
}

// AdBanner - shows leaderboard on desktop, mobile banner on mobile
export function AdBanner({ className = '', id: _id }: { className?: string; id?: string }) {
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

// InContentAd - for in-article/in-page ads
export function InContentAd({ className = '', id: _id }: { className?: string; id?: string }) {
  return <BannerAd468 className={className} />;
}

// 728x90 Leaderboard display ad (Adsterra)
export function LeaderboardAd({ className = '' }: { className?: string }) {
  const adRef = useRef<HTMLDivElement>(null);
  const [adId] = useState(() => getAdId());

  useEffect(() => {
    if (!adRef.current || adRef.current.querySelector('script')) return;

    const container = adRef.current;

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
    <div ref={adRef} id={adId} className={`ad-container flex justify-center ${className}`} style={{ minHeight: 90 }}>
    </div>
  );
}

// 300x250 Sidebar display ad (Adsterra)
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

// 160x300 Skyscraper display ad (Adsterra)
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

// 468x60 Banner ad (Adsterra)
export function BannerAd468({ className = '' }: { className?: string }) {
  const adRef = useRef<HTMLDivElement>(null);
  const [adId] = useState(() => getAdId());

  useEffect(() => {
    if (!adRef.current || adRef.current.querySelector('script')) return;

    const container = adRef.current;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.innerHTML = `
      atOptions = {
        'key' : '1e03506bd1599ceabdf2f622ed71e1f4',
        'format' : 'iframe',
        'height' : 60,
        'width' : 468,
        'params' : {}
      };
    `;
    container.appendChild(script);

    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = 'https://www.highperformanceformat.com/1e03506bd1599ceabdf2f622ed71e1f4/invoke.js';
    container.appendChild(invokeScript);
  }, [adId]);

  return (
    <div ref={adRef} id={adId} className={`ad-container flex justify-center my-4 ${className}`} style={{ minHeight: 60 }}>
    </div>
  );
}

// 160x600 Wide Skyscraper display ad (Adsterra)
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

// 320x50 Mobile banner ad (Adsterra)
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
    <div ref={adRef} id={adId} className={`ad-container flex justify-center ${className}`} style={{ minHeight: 50 }}>
    </div>
  );
}

// HilltopAds Banner 1
export function HilltopAdBanner1({ className = '' }: { className?: string }) {
  const adRef = useRef<HTMLDivElement>(null);
  const [adId] = useState(() => getAdId());

  useEffect(() => {
    if (!adRef.current || adRef.current.querySelector('script')) return;

    const container = adRef.current;
    const script = document.createElement('script');
    script.async = true;
    script.referrerPolicy = 'no-referrer-when-downgrade';
    script.src = '//lucky-throat.com/bYXxV/s.dpGClY0BYiWVcQ/beZm-9RuiZDU/lGkjPaTMYO3qNuzsYw5IMVjJkBtANKj/cz3zNijIkezBM/wN';
    container.appendChild(script);
  }, [adId]);

  return (
    <div ref={adRef} id={adId} className={`ad-container flex justify-center ${className}`}>
    </div>
  );
}

// HilltopAds Banner 2
export function HilltopAdBanner2({ className = '' }: { className?: string }) {
  const adRef = useRef<HTMLDivElement>(null);
  const [adId] = useState(() => getAdId());

  useEffect(() => {
    if (!adRef.current || adRef.current.querySelector('script')) return;

    const container = adRef.current;
    const script = document.createElement('script');
    script.async = true;
    script.referrerPolicy = 'no-referrer-when-downgrade';
    script.src = '//lucky-throat.com/bXXYV_sod.GClv0mYeWhcB/seImA9huHZ/U/lEk/P/TbYw3vNJzTYN5INnDvUEtcN/jZcj3lNwjukl0UOCQy';
    container.appendChild(script);
  }, [adId]);

  return (
    <div ref={adRef} id={adId} className={`ad-container flex justify-center ${className}`}>
    </div>
  );
}

// HilltopAds Banner 3
export function HilltopAdBanner3({ className = '' }: { className?: string }) {
  const adRef = useRef<HTMLDivElement>(null);
  const [adId] = useState(() => getAdId());

  useEffect(() => {
    if (!adRef.current || adRef.current.querySelector('script')) return;

    const container = adRef.current;
    const script = document.createElement('script');
    script.async = true;
    script.referrerPolicy = 'no-referrer-when-downgrade';
    script.src = '//lucky-throat.com/bMXFV.smdkGklj0/YLW-cy/be/mh9Lu/ZUUvlxkQPYTkY/3UNjz-EaylMBjUE/thNEjOcQ3UM-TnImyqNCQj';
    container.appendChild(script);
  }, [adId]);

  return (
    <div ref={adRef} id={adId} className={`ad-container flex justify-center ${className}`}>
    </div>
  );
}

// HilltopAds Banner 4
export function HilltopAdBanner4({ className = '' }: { className?: string }) {
  const adRef = useRef<HTMLDivElement>(null);
  const [adId] = useState(() => getAdId());

  useEffect(() => {
    if (!adRef.current || adRef.current.querySelector('script')) return;

    const container = adRef.current;
    const script = document.createElement('script');
    script.async = true;
    script.referrerPolicy = 'no-referrer-when-downgrade';
    script.src = '//lucky-throat.com/beXYV.s/dlG-lk0LYpW/ch/AemmL9wuSZtUdl/kwPYT/Yc3rNJzRYZ5cN/D/UstCNDjbcd3oN/jhkD0MOyQd';
    container.appendChild(script);
  }, [adId]);

  return (
    <div ref={adRef} id={adId} className={`ad-container flex justify-center ${className}`}>
    </div>
  );
}

// HilltopAds Banner 5
export function HilltopAdBanner5({ className = '' }: { className?: string }) {
  const adRef = useRef<HTMLDivElement>(null);
  const [adId] = useState(() => getAdId());

  useEffect(() => {
    if (!adRef.current || adRef.current.querySelector('script')) return;

    const container = adRef.current;
    const script = document.createElement('script');
    script.async = true;
    script.referrerPolicy = 'no-referrer-when-downgrade';
    script.src = '//lucky-throat.com/bgX.VNs/dVGNlN0vYWWfcc/oe_mh9OutZ/UklJkxPOTPYq3GNuzJYl5bMajJk_tXNLjBcA3_NwjNk/zOMTwH';
    container.appendChild(script);
  }, [adId]);

  return (
    <div ref={adRef} id={adId} className={`ad-container flex justify-center ${className}`}>
    </div>
  );
}

// HilltopAds Banner 6
export function HilltopAdBanner6({ className = '' }: { className?: string }) {
  const adRef = useRef<HTMLDivElement>(null);
  const [adId] = useState(() => getAdId());

  useEffect(() => {
    if (!adRef.current || adRef.current.querySelector('script')) return;

    const container = adRef.current;
    const script = document.createElement('script');
    script.async = true;
    script.referrerPolicy = 'no-referrer-when-downgrade';
    script.src = '//lucky-throat.com/bfXaVRsxd.Gvl/0DYPWQcP/Tesm/9MuAZYUKlOkIPFT/YB3/NLzlEryQM_j/ETtBNgjIcT3vMWTsIjyoNQQE';
    container.appendChild(script);
  }, [adId]);

  return (
    <div ref={adRef} id={adId} className={`ad-container flex justify-center ${className}`}>
    </div>
  );
}
