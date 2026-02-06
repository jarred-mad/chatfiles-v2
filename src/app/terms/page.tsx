import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions | ChatFiles.org',
  description: 'Terms and Conditions for using ChatFiles.org.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms and Conditions</h1>
        <p className="text-gray-500 mb-8">Last updated: February 2026</p>

        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing and using ChatFiles.org (&quot;the Website&quot;), you accept and agree to be bound
              by these Terms and Conditions. If you do not agree to these terms, please do not use
              the Website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-600 leading-relaxed">
              ChatFiles.org provides a searchable archive of publicly released U.S. Department of
              Justice documents related to the Epstein investigation. These documents are public
              records made available through the EPSTEIN&apos;s VICTIMS Act.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">3. Use of Content</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              The documents hosted on this Website are public government records. However, your
              use of this Website is subject to the following conditions:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li>You agree not to use the Website for any unlawful purpose.</li>
              <li>You agree not to harass, defame, or harm any individuals mentioned in the documents.</li>
              <li>You agree not to republish content in a manner that suggests wrongdoing by individuals merely mentioned in documents.</li>
              <li>You agree not to use automated systems to scrape or download content in bulk without permission.</li>
              <li>You understand that facial recognition results are probabilistic and may contain errors.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">4. Disclaimer of Warranties</h2>
            <p className="text-gray-600 leading-relaxed">
              THE WEBSITE AND ALL CONTENT ARE PROVIDED &quot;AS IS&quot; WITHOUT WARRANTY OF ANY KIND,
              EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
              FITNESS FOR A PARTICULAR PURPOSE, AND NONINFRINGEMENT.
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              We do not warrant that:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4 mt-2">
              <li>The Website will be uninterrupted or error-free</li>
              <li>The content is complete, accurate, or up-to-date</li>
              <li>Facial recognition identifications are accurate</li>
              <li>Any statements made in documents are true or verified</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">5. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              IN NO EVENT SHALL CHATFILES.ORG, ITS OPERATORS, OR CONTRIBUTORS BE LIABLE FOR ANY
              INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT
              LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES,
              RESULTING FROM YOUR ACCESS TO OR USE OF (OR INABILITY TO ACCESS OR USE) THE WEBSITE.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">6. Important Disclaimers</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-900 leading-relaxed mb-4">
                <strong>Being mentioned in a document does not indicate guilt or wrongdoing.</strong>
              </p>
              <p className="text-amber-800 leading-relaxed mb-4">
                The documents contain names of individuals who may be victims, witnesses, associates,
                or simply mentioned in passing. The presence of a name in these documents should not
                be interpreted as an accusation or evidence of any wrongdoing.
              </p>
              <p className="text-amber-800 leading-relaxed">
                <strong>Facial recognition results are probabilistic.</strong> Our system uses machine
                learning to identify similar faces, but false positives can and do occur. Users should
                independently verify any identifications.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">7. User Comments</h2>
            <p className="text-gray-600 leading-relaxed">
              Users may submit comments on certain pages. By submitting a comment, you agree that:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4 mt-2">
              <li>Your comment does not contain defamatory, libelous, or illegal content</li>
              <li>Your comment does not harass or threaten any individual</li>
              <li>You grant us the right to display your comment publicly</li>
              <li>We may remove any comment at our sole discretion</li>
              <li>You are solely responsible for the content of your comments</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">8. Intellectual Property</h2>
            <p className="text-gray-600 leading-relaxed">
              The documents hosted on this Website are U.S. government public records and are not
              subject to copyright protection. However, our website design, logo, and original
              content are protected by intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">9. Third-Party Links</h2>
            <p className="text-gray-600 leading-relaxed">
              The Website may contain links to third-party websites. We are not responsible for
              the content or privacy practices of these external sites. We encourage you to read
              the terms and privacy policies of any third-party sites you visit.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">10. Modification of Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to modify these Terms and Conditions at any time. Changes will
              be effective immediately upon posting to the Website. Your continued use of the
              Website after any changes constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">11. Governing Law</h2>
            <p className="text-gray-600 leading-relaxed">
              These Terms and Conditions shall be governed by and construed in accordance with
              the laws of the United States of America, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">12. Contact Information</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions about these Terms and Conditions, please contact us at:{' '}
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
