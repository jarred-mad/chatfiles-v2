'use client';

import { useState, useEffect } from 'react';

export default function AgeVerification() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check if user has already verified
    const isVerified = localStorage.getItem('age_verified');
    if (!isVerified) {
      setShowModal(true);
    }
  }, []);

  const handleVerify = () => {
    localStorage.setItem('age_verified', 'true');
    setShowModal(false);
  };

  const handleDecline = () => {
    window.location.href = 'https://www.google.com';
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-navy text-white px-6 py-4">
          <h2 className="text-xl font-bold">Age Verification Required</h2>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Age Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="font-bold text-red-800">18+ Content Warning</h3>
                <p className="text-sm text-red-700 mt-1">
                  This archive contains official DOJ documents that may include mature content,
                  graphic descriptions, and sensitive material related to criminal investigations.
                  You must be 18 years or older to access this site.
                </p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-bold text-amber-800">Important Disclaimer</h3>
                <p className="text-sm text-amber-700 mt-1">
                  Being mentioned in these files does not indicate wrongdoing. Names appear in various
                  contexts including photos, contact books, third-party emails, unverified FBI tips,
                  flight logs, and social correspondence. None of the individuals listed have been
                  charged with crimes connected to the Epstein investigation (aside from Ghislaine Maxwell).
                </p>
              </div>
            </div>
          </div>

          {/* Removed Content Notice */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-gray-800 mb-2">Regarding Removed Content</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              ChatFiles.org does not host, store, or redistribute any documents that have been removed
              by the U.S. Department of Justice. If the DOJ has determined that certain materials should
              not be publicly available — whether for reasons of national security, victim protection,
              or ongoing legal proceedings — we respect and stand by that decision.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed mt-2">
              Our archive reflects only what is currently published and accessible through official DOJ
              channels. We do not seek to obtain, restore, or circulate removed content. Any materials
              no longer available on the DOJ&apos;s official Epstein Library have been removed from our
              platform as well.
            </p>
            <p className="text-sm text-gray-600 mt-2">
              If you believe any content on this site should not be publicly available, please contact
              the DOJ directly at{' '}
              <a href="mailto:EFTA@usdoj.gov" className="text-navy hover:underline font-medium">
                EFTA@usdoj.gov
              </a>
            </p>
          </div>

          {/* Terms */}
          <p className="text-xs text-gray-500 text-center">
            By clicking &quot;I am 18+ and Accept&quot;, you confirm that you are at least 18 years old
            and agree to our terms of use.
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleDecline}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium"
          >
            Exit Site
          </button>
          <button
            onClick={handleVerify}
            className="px-6 py-3 bg-navy text-white rounded-lg hover:bg-navy-light transition-colors font-medium"
          >
            I am 18+ and Accept
          </button>
        </div>
      </div>
    </div>
  );
}
