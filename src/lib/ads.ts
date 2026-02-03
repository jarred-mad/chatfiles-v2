// Google AdSense Configuration

export const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-XXXXXXXXXX';

// Ad slot IDs - replace with actual IDs from AdSense
export const AD_SLOTS = {
  // Header leaderboard (728x90)
  headerLeaderboard: 'XXXXXXXXXX',

  // Sidebar ads (300x250)
  searchSidebar: 'XXXXXXXXXX',
  documentSidebar: 'XXXXXXXXXX',

  // In-content ads (300x250)
  homeMiddle: 'XXXXXXXXXX',
  browseMiddle: 'XXXXXXXXXX',
  searchInline: 'XXXXXXXXXX',
  photosInline: 'XXXXXXXXXX',

  // Mobile banner (320x50)
  mobileFooter: 'XXXXXXXXXX',
} as const;

// Ad sizes
export const AD_SIZES = {
  leaderboard: { width: 728, height: 90 },
  sidebar: { width: 300, height: 250 },
  incontent: { width: 300, height: 250 },
  'mobile-banner': { width: 320, height: 50 },
} as const;

export type AdSize = keyof typeof AD_SIZES;

/**
 * Check if ads should be shown
 * Returns false if ad blocker detected or in development
 */
export function shouldShowAds(): boolean {
  // Don't show in development
  if (process.env.NODE_ENV === 'development') {
    return false;
  }

  // Check for ad blocker (client-side only)
  if (typeof window !== 'undefined') {
    // Simple ad blocker detection
    const testAd = document.createElement('div');
    testAd.innerHTML = '&nbsp;';
    testAd.className = 'adsbox ad-placement pub_300x250';
    testAd.style.cssText = 'position: absolute; left: -9999px;';
    document.body.appendChild(testAd);

    const isBlocked = testAd.offsetHeight === 0;
    document.body.removeChild(testAd);

    if (isBlocked) {
      return false;
    }
  }

  return true;
}

/**
 * Initialize AdSense (call once on page load)
 */
export function initAdsense(): void {
  if (typeof window === 'undefined') return;

  try {
    // @ts-expect-error - AdSense global
    (window.adsbygoogle = window.adsbygoogle || []).push({
      google_ad_client: ADSENSE_CLIENT_ID,
      enable_page_level_ads: true,
    });
  } catch (error) {
    console.error('AdSense initialization error:', error);
  }
}

/**
 * Push a new ad (call after ad element is in DOM)
 */
export function pushAd(): void {
  if (typeof window === 'undefined') return;

  try {
    // @ts-expect-error - AdSense global
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  } catch (error) {
    console.error('AdSense push error:', error);
  }
}
