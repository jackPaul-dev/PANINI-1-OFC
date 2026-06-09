import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";

export default function TermsOfUse() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <Header locale="en" />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <button onClick={() => setLocation("/")} className="flex items-center gap-2 text-sm text-[#6b0f1a] font-semibold mb-8 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to store
        </button>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Terms of Use</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: June 1, 2026</p>

        <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">1. Acceptance of Terms</h2>
            <p>By accessing and using paniniworldcup2026.site ("Site"), you accept and agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use the Site.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">2. Products and Orders</h2>
            <p>All products are subject to availability. We reserve the right to discontinue any product at any time. Prices are subject to change without notice. We reserve the right to refuse any order.</p>
            <p className="mt-2">By placing an order, you represent that you are at least 18 years of age and are legally capable of entering into binding contracts.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">3. Payment</h2>
            <p>Payment is processed securely through Stripe. We accept Visa, Mastercard, Apple Pay, and Google Pay. Your payment information is encrypted and never stored on our servers. All prices are in US Dollars (USD) and include applicable taxes where required.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">4. Shipping</h2>
            <p>We offer free shipping across the continental United States. Orders are typically processed within 1–2 business days. Estimated delivery time is 2–4 business days after processing. We are not responsible for delays caused by shipping carriers or circumstances beyond our control.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">5. Intellectual Property</h2>
            <p>All content on this Site, including text, graphics, images, and logos, is the property of Panini USA LLC or its licensors and is protected by US and international copyright laws. You may not reproduce, distribute, or create derivative works without our express written permission.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">6. Disclaimer of Warranties</h2>
            <p>The Site and products are provided "as is" without warranties of any kind, either express or implied. We do not warrant that the Site will be uninterrupted or error-free.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">7. Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, Panini USA LLC shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Site or purchase of products.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">8. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of the State of New York, United States, without regard to its conflict of law provisions.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">9. Contact Us</h2>
            <p>For questions regarding these Terms of Use, please contact:<br />
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
