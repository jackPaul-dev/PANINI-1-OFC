import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, CheckCircle2, ShieldCheck, Truck, Lock,
  CheckCircle, Loader2, AlertCircle, Apple, Package
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Header } from "@/components/Header";
import { kits } from "@/lib/kits";
import { pixelInitiateCheckout, pixelPurchase } from "@/lib/pixel";
import countryConfig from "@/lib/countryConfig";

const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string;
const stripePromise = loadStripe(STRIPE_PK);

const stripeAppearance: import("@stripe/stripe-js").Appearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#16a34a",
    colorBackground: "#ffffff",
    colorText: "#111827",
    colorDanger: "#ef4444",
    fontFamily: "system-ui, -apple-system, sans-serif",
    borderRadius: "12px",
    spacingUnit: "5px",
  },
  rules: {
    ".Input": {
      border: "1px solid #e5e7eb",
      boxShadow: "none",
      padding: "12px 16px",
      fontSize: "15px",
    },
    ".Input:focus": {
      border: "1px solid #16a34a",
      boxShadow: "0 0 0 3px rgba(22,163,74,0.12)",
    },
    ".Label": {
      fontWeight: "600",
      fontSize: "13px",
      color: "#374151",
      marginBottom: "6px",
    },
    ".Tab": {
      border: "2px solid #e5e7eb",
      borderRadius: "12px",
      padding: "10px 12px",
    },
    ".Tab--selected": {
      border: "2px solid #16a34a",
      backgroundColor: "#f0fdf4",
      color: "#16a34a",
    },
    ".Tab:hover": {
      border: "2px solid #16a34a",
    },
    ".TabLabel--selected": {
      color: "#16a34a",
      fontWeight: "700",
    },
    ".Block": {
      borderRadius: "12px",
    },
  },
};

// ── Stripe payment inner form ─────────────────────────────────────────────────
interface StripeFormProps {
  orderTotal: number;
  kitName: string;
  formData: FormData;
  countryCode: string;
  onSuccess: (transactionID: string) => void;
  onError: (msg: string) => void;
  onBack: () => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
}

function StripePaymentForm({
  orderTotal,
  formData,
  countryCode,
  onSuccess,
  onError,
  onBack,
  loading,
  setLoading,
}: StripeFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [ready, setReady] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!stripe || !elements) return;
    setLoading(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href,
          payment_method_data: {
            billing_details: {
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              address: {
                line1: `${formData.address} ${formData.apt}`.trim(),
                city: formData.city,
                state: formData.state,
                postal_code: formData.zipCode,
                country: countryCode,
              },
            },
          },
        },
        redirect: "if_required",
      });

      if (error) {
        onError(error.message ?? "Payment error. Please try again.");
      } else if (paymentIntent?.status === "succeeded") {
        onSuccess(paymentIntent.id);
      }
    } catch {
      onError("Unable to connect to payment server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [stripe, elements, formData, onSuccess, onError, setLoading]);

  return (
    <div className="px-5 pt-5 pb-3">
      <h2 className="text-xl font-bold text-gray-900 mb-1">Payment</h2>
      <p className="text-xs text-gray-400 mb-5">
        Transaction protected with 256-bit SSL encryption.
      </p>

      <div className={`transition-all duration-300 ${ready ? "opacity-100" : "opacity-0"}`}>
        <PaymentElement
          onReady={() => setReady(true)}
          options={{
            wallets: { applePay: "auto", googlePay: "auto" },
            layout: { type: "tabs", defaultCollapsed: false },
            fields: { billingDetails: "never" },
          }}
        />
      </div>

      {!ready && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-gray-400">Loading payment methods…</span>
        </div>
      )}

      <div className="mt-5 border-t border-gray-100 pt-4 space-y-1.5 mb-5">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Shipping</span>
          <span className="text-primary font-semibold">Free</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-2">
          <span className="font-black text-gray-900 text-base">Total</span>
          <span className="font-black text-primary text-xl">${orderTotal.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="flex-shrink-0 px-5 py-4 rounded-full border-2 border-gray-300 text-gray-700 font-black text-sm hover:border-gray-400 transition-all disabled:opacity-40"
        >
          BACK
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !stripe || !ready}
          className="flex-1 bg-primary hover:bg-green-700 disabled:opacity-60 text-white font-black text-base py-4 rounded-full flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          {loading
            ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing…</>
            : <>Complete Order &rarr;</>
          }
        </button>
      </div>

      <p className="text-center text-[11px] text-gray-400 mb-2">
        {countryConfig.footerNote}
      </p>
      <div className="flex items-center justify-center gap-2 mb-3 text-gray-400">
        <Apple className="w-4 h-4" />
        <span className="text-[11px]">Apple Pay</span>
        <span className="text-gray-200">·</span>
        <span className="text-[11px]">Google Pay</span>
        <span className="text-gray-200">·</span>
        <span className="text-[11px]">Credit Card</span>
      </div>
      <p className="text-center text-[10px] text-gray-400">
        {countryConfig.companyInfo}<br />Official FIFA World Cup 2026 Licensee
      </p>
    </div>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface FormData {
  email: string;
  name: string;
  phone: string;
  zipCode: string;
  address: string;
  apt: string;
  city: string;
  state: string;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Checkout() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const kitId = searchParams.get("kit") || "campeao";
  const kit = kits.find((k) => k.id === kitId) || kits[2];

  const [step, setStep] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentDone, setPaymentDone] = useState(false);
  const [transactionID, setTransactionID] = useState<string | null>(null);
  const [selectedBumps, setSelectedBumps] = useState<Set<string>>(new Set());
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [intentError, setIntentError] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState<string>(countryConfig.countryCode);


  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [step]);

  // Detect Stripe 3D Secure redirect return
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirectStatus = params.get("redirect_status");
    const paymentIntentId = params.get("payment_intent");

    if (redirectStatus === "succeeded" && paymentIntentId) {
      const raw = sessionStorage.getItem("panini_pending_order");
      sessionStorage.removeItem("panini_pending_order");

      if (raw) {
        try {
          const order = JSON.parse(raw) as {
            kitId: string;
            orderTotal: number;
            bumps: string[];
            formData?: {
              email: string; name: string; address: string; apt: string;
              city: string; zipCode: string; state: string;
            };
          };
          pixelPurchase(
            {
              content_ids: [order.kitId, ...order.bumps],
              value: order.orderTotal,
              currency: countryConfig.currency,
              num_items: 1 + order.bumps.length,
            },
            paymentIntentId
          );
          if (order.formData?.email) {
            const resolvedKit = kits.find(k => k.id === order.kitId) || kits[2];
            const bumpsLabels = [
              { id: "bump50", label: "+50 sticker packs (~250 stickers)" },
              { id: "bump100", label: "+100 sticker packs (~500 stickers)" },
              { id: "bump250", label: "+250 sticker packs (~1,250 stickers)" },
            ];
            const items = [
              resolvedKit.name,
              ...order.bumps.map(bId => bumpsLabels.find(b => b.id === bId)?.label ?? bId),
            ];
            fetch("/api/emails/trigger", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                paymentIntentId,
                customerEmail: order.formData.email,
                customerName: order.formData.name,
                address: `${order.formData.address} ${order.formData.apt}`.trim(),
                city: order.formData.city,
                postalCode: order.formData.zipCode,
                province: order.formData.state,
                country: countryCode,
                amount: order.orderTotal,
                items,
              }),
            }).catch(() => {});
          }
        } catch {
          // ignore parse error
        }
      }

      setTransactionID(paymentIntentId);
      setPaymentDone(true);
      window.history.replaceState({}, "", `/checkout?kit=${kitId}`);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const orderBumps = countryConfig.orderBumps;

  const bumpsTotal = orderBumps.filter(b => selectedBumps.has(b.id)).reduce((s, b) => s + b.price, 0);
  const orderTotal = kit.price * quantity + bumpsTotal;

  const toggleBump = (id: string) => {
    setSelectedBumps(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const [formData, setFormData] = useState<FormData>({
    email: "", name: "", phone: "",
    zipCode: "", address: "", apt: "",
    city: "", state: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Create PaymentIntent when reaching step 3
  useEffect(() => {
    if (step !== 3 || clientSecret) return;
    setIntentError(null);

    fetch("/api/payment/create-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: orderTotal,
        kitName: kit.name,
        payer: {
          email: formData.email,
          name: formData.name,
          document: "",
          phone: formData.phone,
        },
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setIntentError(data.error);
        } else {
          setClientSecret(data.clientSecret);
          sessionStorage.setItem(
            "panini_pending_order",
            JSON.stringify({
              kitId: kit.id,
              orderTotal,
              bumps: Array.from(selectedBumps),
              formData,
            })
          );
          pixelInitiateCheckout({
            content_ids: [kit.id],
            value: orderTotal,
            currency: countryConfig.currency,
            num_items: 1 + selectedBumps.size,
          });
        }
      })
      .catch(() => setIntentError("Unable to connect to the payment server."));
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStepNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStep(s => s + 1);
  };

  const handlePaymentSuccess = (txId: string) => {
    setTransactionID(txId);
    setPaymentDone(true);
    pixelPurchase(
      {
        content_ids: [kit.id, ...Array.from(selectedBumps)],
        value: orderTotal,
        currency: countryConfig.currency,
        num_items: 1 + selectedBumps.size,
      },
      txId
    );
    const selectedBumpsList = orderBumps.filter(b => selectedBumps.has(b.id));
    const emailItems = [kit.name, ...selectedBumpsList.map(b => b.label)];
    fetch("/api/emails/trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paymentIntentId: txId,
        customerEmail: formData.email,
        customerName: formData.name,
        address: `${formData.address} ${formData.apt}`.trim(),
        city: formData.city,
        postalCode: formData.zipCode,
        province: formData.state,
        country: countryCode,
        amount: orderTotal,
        items: emailItems,
      }),
    }).catch(() => {});
  };

  // ── Success screen ────────────────────────────────────────────────────────────
  if (paymentDone) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center">
        <Header />
        <main className="w-full max-w-md mx-auto p-4 py-12 flex-1 flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6"
          >
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h1 className="text-2xl font-black text-gray-900 mb-2">Payment Complete!</h1>
            <p className="text-gray-500 text-sm mb-6 max-w-xs">
              Thank you for your order. You'll receive a confirmation email with delivery details.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full bg-white border border-gray-100 rounded-2xl p-5 mb-6 text-left shadow-sm"
          >
            <h3 className="font-bold text-gray-900 text-sm mb-3 border-b pb-2">Order Summary</h3>
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-gray-500">Product</span>
              <span className="font-medium text-gray-900">{kit.name}</span>
            </div>
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-gray-500">Shipping</span>
              <span className="font-medium text-green-600">Free</span>
            </div>
            <div className="flex justify-between mb-2 text-sm border-t pt-2 mt-1">
              <span className="text-gray-500 font-bold">Total</span>
              <span className="font-black text-primary">${orderTotal.toFixed(2)}</span>
            </div>
            {transactionID && (
              <div className="flex justify-between text-xs mt-1">
                <span className="text-gray-400">Reference</span>
                <span className="text-gray-400 font-mono">{transactionID.slice(0, 20)}…</span>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-left"
          >
            <p className="text-xs font-bold text-blue-700 mb-1 uppercase tracking-wide">Next Steps</p>
            <p className="text-sm text-blue-800">
              You'll receive a confirmation email at <strong>{formData.email}</strong>. {countryConfig.confirmationNote}
            </p>
          </motion.div>

          <button
            onClick={() => setLocation("/")}
            className="text-primary font-bold hover:underline text-sm"
          >
            ← Back to store
          </button>
        </main>
      </div>
    );
  }

  // ── Checkout form ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pb-12">
      <Header />

      <main className="w-full max-w-5xl mx-auto px-4 pt-6 pb-4">

        {/* Stepper */}
        <div className="flex items-center justify-between px-2 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${step >= i ? "bg-primary text-white" : "bg-gray-200 text-gray-400"}`}>
                {step > i ? <CheckCircle2 className="w-5 h-5" /> : i}
              </div>
              <span className={`ml-2 text-xs md:text-sm font-semibold ${step >= i ? "text-gray-900" : "text-gray-400"}`}>
                {i === 1 ? "Order" : i === 2 ? "Delivery" : "Payment"}
              </span>
              {i < 3 && <div className={`w-8 md:w-16 h-1 mx-2 rounded ${step > i ? "bg-primary" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Order Summary sidebar */}
          <div className="lg:col-span-5 lg:col-start-8 lg:row-start-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
              <div className="relative overflow-hidden bg-gray-50 border-b border-gray-100">
                <img src={kit.img} alt={kit.name} className="w-full h-28 lg:h-36 object-contain py-2 px-8" />
                <div
                  className="absolute top-[28px] right-[-36px] w-[148px] text-center py-[5px] rotate-45 shadow-lg"
                  style={{ background: "linear-gradient(135deg, #f5a623 0%, #fbbf24 40%, #f5a623 100%)" }}
                >
                  <span className="text-[10px] font-black tracking-[0.18em] uppercase text-[#7c4a00]">Promotion</span>
                </div>
              </div>
              <div className="px-4 py-3">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="font-bold text-gray-900 text-sm">{kit.name}{quantity > 1 ? ` ×${quantity}` : ""}</p>
                  <span className="text-xs font-black text-primary">${(kit.price * quantity).toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-400 mb-1">{kit.contents}</p>
                <div className="flex items-center gap-1 text-yellow-500 text-xs mb-3">
                  ★★★★★ <span className="text-gray-400">4.9 · +2,200 reviews</span>
                </div>
                <div className="space-y-1 border-t border-gray-100 pt-2">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Regular price</span>
                    <span className="line-through">${(kit.oldPrice * quantity).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Shipping</span>
                    <span className="text-green-600 font-semibold">Free</span>
                  </div>
                  {orderBumps.filter(b => selectedBumps.has(b.id)).map(b => (
                    <div key={b.id} className="flex justify-between text-xs text-gray-500">
                      <span className="truncate pr-2">{b.label}</span>
                      <span className="flex-shrink-0">+${b.price.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="font-bold text-gray-900 text-xs">Total (tax incl.)</span>
                    <span className="text-base font-black text-primary">${orderTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7 lg:col-start-1 lg:row-start-1 flex flex-col gap-6">

            {/* Quantity selector */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 px-5 py-4 flex items-center gap-5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{kit.name}</p>
                  <p className="text-xs text-gray-400 truncate">{kit.contents}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-full border-2 border-primary text-primary font-black text-lg flex items-center justify-center hover:bg-primary hover:text-white transition-all active:scale-95 disabled:opacity-40"
                    disabled={quantity <= 1}>−</button>
                  <span className="text-xl font-black text-gray-900 w-7 text-center">{quantity}</span>
                  <button type="button" onClick={() => setQuantity(q => Math.min(10, q + 1))}
                    className="w-9 h-9 rounded-full border-2 border-primary text-primary font-black text-lg flex items-center justify-center hover:bg-primary hover:text-white transition-all active:scale-95 disabled:opacity-40"
                    disabled={quantity >= 10}>+</button>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-black text-primary">${(kit.price * quantity).toFixed(2)}</p>
                  {quantity > 1 && <p className="text-xs text-green-600 font-semibold">Free shipping</p>}
                </div>
              </motion.div>
            )}

            {/* Step 1 — Personal Info */}
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                onSubmit={handleStepNext}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6">1. Your Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                      placeholder="name@gmail.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input required type="text" name="name" value={formData.name} onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                      placeholder="First and Last Name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <input required type="tel" name="phone" value={formData.phone} onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                      placeholder={countryConfig.phonePlaceholder} />
                    <p className="text-xs text-gray-500 mt-1">For delivery SMS notifications.</p>
                  </div>
                </div>
                <button type="submit"
                  className="mt-8 w-full bg-primary hover:bg-green-700 text-white font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                  Continue <ChevronRight className="w-5 h-5" />
                </button>
              </motion.form>
            )}

            {/* Step 2 — Delivery Address */}
            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                onSubmit={handleStepNext}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden p-6"
              >
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-xl font-bold text-gray-900">Delivery Address</h2>
                  <button type="button" onClick={() => setStep(1)} className="text-sm text-primary font-medium hover:underline">Edit info</button>
                </div>
                <p className="text-sm text-gray-400 mb-6 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-green-500" /> {countryConfig.shippingDescription}
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">ZIP Code <span className="text-red-500">*</span></label>
                    <input required type="text" name="zipCode" value={formData.zipCode} onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-gray-50 focus:bg-white"
                      placeholder="10001" maxLength={10} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">Street Address <span className="text-red-500">*</span></label>
                    <input required type="text" name="address" value={formData.address} onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-gray-50 focus:bg-white"
                      placeholder="123 Main Street" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">Apt / Suite / Unit</label>
                    <input type="text" name="apt" value={formData.apt} onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-gray-50 focus:bg-white"
                      placeholder="Apt 4B" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">City <span className="text-red-500">*</span></label>
                    <input required type="text" name="city" value={formData.city} onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-gray-50 focus:bg-white"
                      placeholder="New York" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">State <span className="text-red-500">*</span></label>
                    <select required name="state" value={formData.state} onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-gray-50 focus:bg-white appearance-none cursor-pointer text-gray-700">
                      <option value="">Select state…</option>
                      {countryConfig.stateList.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button type="submit"
                  className="mt-8 w-full bg-primary hover:bg-green-700 text-white font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                  Continue <ChevronRight className="w-5 h-5" />
                </button>
              </motion.form>
            )}

            {/* Step 3 — Order Bumps + Stripe Payment */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Order Bumps */}
                <div className="bg-green-50 border-b border-green-100 px-5 py-3">
                  <p className="text-sm font-black text-primary text-center">Add more sticker packs at a special promotional price</p>
                </div>

                <div className="divide-y divide-gray-100">
                  {orderBumps.map(bump => {
                    const active = selectedBumps.has(bump.id);
                    return (
                      <div key={bump.id} className={`p-4 transition-colors ${active ? "bg-green-50" : "bg-white"}`}>
                        <div className="flex gap-3 mb-3">
                          <img src={bump.img} alt={bump.label} className="w-16 h-16 object-contain rounded-lg border border-gray-100 bg-white flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                              <span className="font-bold text-gray-900 text-sm">{bump.label}</span>
                              {bump.badge && (
                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${bump.badge.cls}`}>{bump.badge.text}</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mb-1.5">{bump.desc}</p>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-xs text-gray-400 line-through">${bump.oldPrice.toFixed(2)}</span>
                              <span className="text-lg font-black text-primary">${bump.price.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleBump(bump.id)}
                          className={`w-full py-2.5 rounded-xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                            active
                              ? "border-primary bg-primary text-white"
                              : "border-primary text-primary bg-white hover:bg-green-50"
                          }`}
                        >
                          {active ? <><CheckCircle className="w-4 h-4" /> Added</> : <>+ Add to Order</>}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Stripe Payment Section */}
                {intentError ? (
                  <div className="px-5 py-6">
                    <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-red-700 font-semibold mb-1">Connection Error</p>
                        <p className="text-sm text-red-600">{intentError}</p>
                        <button
                          onClick={() => { setClientSecret(null); setIntentError(null); setStep(3); }}
                          className="mt-2 text-xs text-red-700 font-bold underline"
                        >
                          Try again
                        </button>
                      </div>
                    </div>
                    <button type="button" onClick={() => setStep(2)}
                      className="mt-4 w-full px-5 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-black text-sm hover:border-gray-400 transition-all">
                      ← Back
                    </button>
                  </div>
                ) : !clientSecret ? (
                  <div className="flex items-center justify-center py-12 gap-3 text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm">Initializing secure payment…</span>
                  </div>
                ) : (
                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret,
                      appearance: stripeAppearance,
                      locale: countryConfig.stripeLocale,
                    }}
                  >
                    <StripePaymentForm
                      orderTotal={orderTotal}
                      kitName={kit.name}
                      formData={formData}
                      countryCode={countryCode}
                      onSuccess={handlePaymentSuccess}
                      onError={(msg) => setError(msg)}
                      onBack={() => setStep(2)}
                      loading={loading}
                      setLoading={setLoading}
                    />
                    {error && (
                      <div className="px-5 pb-4">
                        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-red-700">{error}</p>
                        </div>
                      </div>
                    )}
                  </Elements>
                )}
              </motion.div>
            )}

            {/* Trust badges — steps 1 & 2 only */}
            <AnimatePresence>
              {step < 3 && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="grid grid-cols-3 gap-3"
                >
                  {[
                    { icon: <Lock className="w-4 h-4" />, label: "Secure Payment" },
                    { icon: <Truck className="w-4 h-4" />, label: "Free Shipping" },
                    { icon: <ShieldCheck className="w-4 h-4" />, label: "7-Day Guarantee" },
                  ].map((b, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-3 flex flex-col items-center gap-1 text-center">
                      <div className="text-primary">{b.icon}</div>
                      <p className="text-[11px] font-semibold text-gray-700">{b.label}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </main>
    </div>
  );
}
