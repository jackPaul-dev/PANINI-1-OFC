import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";

export default function ReturnPolicy() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <Header locale="en" />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <button onClick={() => setLocation("/")} className="flex items-center gap-2 text-sm text-[#6b0f1a] font-semibold mb-8 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to store
        </button>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Return & Refund Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: June 1, 2026</p>

        <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">Our Policy</h2>
            <p>We want you to be completely satisfied with your purchase. If you are not satisfied for any reason, we're here to help.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">Returns</h2>
            <p>You have <strong>30 calendar days</strong> from the date of delivery to initiate a return. To be eligible for a return:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>The item must be unused and in the same condition as received</li>
              <li>The item must be in its original packaging</li>
              <li>You must provide proof of purchase (order confirmation email)</li>
            </ul>
            <p className="mt-3">Items that cannot be returned:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Opened sticker packs (once opened, stickers cannot be returned for hygienic reasons)</li>
              <li>Items purchased during clearance or final sale promotions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">Refunds</h2>
            <p>Once we receive and inspect your returned item, we will notify you of the approval or rejection of your refund. If approved, your refund will be processed to your original payment method within <strong>5–10 business days</strong>.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">Damaged or Defective Items</h2>
            <p>If you receive a damaged or defective item, please contact us within <strong>7 days of delivery</strong> with your order number and a photo of the damage. We will arrange a replacement or full refund at no additional cost to you.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">Exchanges</h2>
            <p>We replace items only if they are defective or damaged. If you need to exchange an item for the same product, contact us at <a href="mailto:support@paniniworldcup2026.site" className="text-[#6b0f1a] underline">support@paniniworldcup2026.site</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">Return Shipping</h2>
            <p>You are responsible for return shipping costs unless the return is due to our error (wrong item sent, defective product). We recommend using a trackable shipping service for returns.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">How to Start a Return</h2>
            <p>To initiate a return, please email us at <a href="mailto:support@paniniworldcup2026.site" className="text-[#6b0f1a] underline">support@paniniworldcup2026.site</a> with:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Your order number</li>
              <li>The item(s) you wish to return</li>
              <li>The reason for the return</li>
            </ul>
            <p className="mt-3">We will respond within 1–2 business days with return instructions.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-gray-900 mb-2">Contact Us</h2>
            <p>
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
