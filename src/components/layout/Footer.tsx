import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-white font-bold text-lg mb-3">ChatFiles.org</h3>
            <p className="text-sm leading-relaxed">
              A searchable archive of publicly released U.S. government documents
              from the Department of Justice Epstein disclosure. All documents
              hosted are official public records.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/search" className="hover:text-white transition-colors">
                  Search Documents
                </Link>
              </li>
              <li>
                <Link href="/photos" className="hover:text-white transition-colors">
                  Photo Gallery
                </Link>
              </li>
              <li>
                <Link href="/browse" className="hover:text-white transition-colors">
                  Browse by Dataset
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About & Disclaimer
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://ko-fi.com/chatfiles"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-md transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.734 4.352.24 7.422-2.831 6.649-6.916zm-11.062 3.511c-1.246 1.453-4.011 3.976-4.011 3.976s-.121.119-.31.023c-.076-.057-.108-.09-.108-.09-.443-.441-3.368-3.049-4.034-3.954-.709-.965-1.041-2.7-.091-3.71.951-1.01 3.005-1.086 4.363.407 0 0 1.565-1.782 3.468-.963 1.904.82 1.832 3.011.723 4.311zm6.173.478c-.928.116-1.682.028-1.682.028V7.284h1.77s1.971.551 1.971 2.638c0 1.913-.985 2.667-2.059 3.015z"/>
                  </svg>
                  Donate on Ko-fi
                </a>
              </li>
              <li className="pt-2">
                <a
                  href="mailto:contact@chatfiles.org"
                  className="hover:text-white transition-colors"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center text-xs">
          <p>&copy; {new Date().getFullYear()} ChatFiles.org. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="/about#disclaimer" className="hover:text-white transition-colors">
              Legal Disclaimer
            </Link>
            <Link href="/about#privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
