import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | ChatFiles.org',
  description: 'Privacy Policy for ChatFiles.org - How we handle your data and protect your privacy.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: February 2026</p>

        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              ChatFiles.org (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information
              when you visit our website chatfiles.org.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We collect minimal data necessary to operate our service:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li><strong>Search Queries:</strong> Anonymized search queries to improve search quality and understand user interests.</li>
              <li><strong>Analytics Data:</strong> Basic page view analytics (pages visited, time on site) through Google Analytics.</li>
              <li><strong>IP Addresses:</strong> Temporarily stored for rate limiting, security, and abuse prevention.</li>
              <li><strong>Comments:</strong> If you submit a comment, we collect your username, email address, and comment content.</li>
              <li><strong>Cookies:</strong> We use essential cookies for site functionality and third-party cookies from advertising partners.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Provide and maintain our website</li>
              <li>Improve search functionality and user experience</li>
              <li>Monitor and analyze usage patterns</li>
              <li>Prevent abuse and maintain security</li>
              <li>Display relevant advertisements</li>
              <li>Respond to user inquiries</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">4. Third-Party Services</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We use the following third-party services:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li><strong>Google Analytics:</strong> For website traffic analysis. Google may collect information according to their privacy policy.</li>
              <li><strong>Advertising Networks:</strong> We work with advertising partners who may use cookies to serve relevant ads.</li>
              <li><strong>Cloudflare:</strong> For content delivery and security services.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">5. Data Sharing</h2>
            <p className="text-gray-600 leading-relaxed">
              We do not sell, trade, or rent your personal identification information to others.
              We may share generic aggregated demographic information not linked to any personal
              identification information with our business partners and advertisers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">6. Data Retention</h2>
            <p className="text-gray-600 leading-relaxed">
              We retain your information only for as long as necessary to fulfill the purposes
              outlined in this privacy policy. IP addresses are typically retained for no more
              than 30 days. Comment data is retained until manually deleted by administrators.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">7. Your Rights</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Request data portability</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-4">
              To exercise these rights, please contact us at contact@chatfiles.org.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">8. Cookies</h2>
            <p className="text-gray-600 leading-relaxed">
              Our website uses cookies to enhance your browsing experience. Cookies are small
              files stored on your device. You can instruct your browser to refuse all cookies
              or indicate when a cookie is being sent. However, some features of our site may
              not function properly without cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">9. Children&apos;s Privacy</h2>
            <p className="text-gray-600 leading-relaxed">
              Our website is not intended for children under 18 years of age. We do not knowingly
              collect personal information from children. If you are a parent or guardian and
              believe your child has provided us with personal information, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">10. Changes to This Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any
              changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot;
              date. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">11. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at:{' '}
              <a href="mailto:contact@chatfiles.org" className="text-accent hover:text-accent-hover">
                contact@chatfiles.org
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
