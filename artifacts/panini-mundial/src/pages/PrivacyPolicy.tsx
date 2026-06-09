import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";

export default function PrivacyPolicy() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <Header locale="en" />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <button onClick={() => setLocation("/")} className="flex items-center gap-2 text-sm text-[#6b0f1a] font-semibold mb-8 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to store
        </button>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: June 1, 2026</p>

        <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">1. Information We Collect</h2>
            <p>When you place an order on paniniworldcup2026.site ("Site"), we collect the following personal information: your name, email address, shipping address, and payment information (processed securely by Stripe — we never store your card details). We may also collect your IP address and browser type through cookies and analytics tools.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Process and fulfill your order</li>
              <li>Send order confirmation and shipping updates via email</li>
              <li>Send promotional emails about our products (you may unsubscribe at any time)</li>
              <li>Improve our website and customer experience</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">3. Sharing Your Information</h2>
            <p>We do not sell or rent your personal information to third parties. We may share your information with trusted service providers who assist us in operating our website and conducting our business (e.g., Stripe for payments, Resend for email delivery, shipping carriers), provided they agree to keep your information confidential.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">4. Cookies</h2>
            <p>We use cookies and similar tracking technologies to track activity on our Site and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. If you do not accept cookies, some portions of our Site may not function properly.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">5. Data Retention</h2>
            <p>We retain your personal data only as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required or permitted by law.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">6. Your Rights</h2>
            <p>You have the right to access, correct, or request deletion of the personal data we hold about you. To exercise these rights, please contact us at <a href="mailto:support@paniniworldcup2026.site" className="text-[#6b0f1a] underline">support@paniniworldcup2026.site</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">7. Security</h2>
            <p>We implement industry-standard security measures to protect your personal information. All payment transactions are encrypted using SSL/TLS technology and processed by Stripe, a PCI-DSS compliant payment processor.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">8. Children's Privacy</h2>
            <p>Our Site is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">9. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page with an updated date.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">10. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at:<br />
            <strong>Panini USA LLC</strong><br />
            Email: <a href="mailto:support@paniniworldcup2026.site" className="text-[#6b0f1a] underline">support@paniniworldcup2026.site</a>
            </p>
          </section>
        </div>
      </div>
      <footer className="bg-[#6b0f1a] text-white/40 text-xs text-center py-4 mt-12">
        © 2026 Panini USA LLC — All rights reserved.
      </footer>
    </div>
  );
}
