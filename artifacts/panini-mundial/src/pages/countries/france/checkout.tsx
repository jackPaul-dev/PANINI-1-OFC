import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, CheckCircle2, ShieldCheck, Truck, Lock,
  Loader2, AlertCircle, Apple, Package
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Header } from "@/components/Header";
import { pixelInitiateCheckout, pixelPurchase } from "@/lib/pixel";
import countryConfig from "@/lib/countryConfigFrance";

const { kits, orderBumps: configBumps, currencySymbol } = countryConfig;

const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string;
const stripePromise = loadStripe(STRIPE_PK, { locale: countryConfig.stripeLocale });

const stripeAppearance: import("@stripe/stripe-js").Appearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#002395",
    colorBackground: "#ffffff",
    colorText: "#111827",
    colorDanger: "#ef4444",
    fontFamily: "system-ui, -apple-system, sans-serif",
    borderRadius: "12px",
    spacingUnit: "5px",
  },
  rules: {
    ".Input": { border: "1px solid #e5e7eb", boxShadow: "none", padding: "12px 16px", fontSize: "15px" },
    ".Input:focus": { border: "1px solid #002395", boxShadow: "0 0 0 3px rgba(0,35,149,0.12)" },
    ".Label": { fontWeight: "600", fontSize: "13px", color: "#374151", marginBottom: "6px" },
    ".Tab": { border: "2px solid #e5e7eb", borderRadius: "12px", padding: "10px 12px" },
    ".Tab--selected": { border: "2px solid #002395", backgroundColor: "#eff6ff", color: "#002395" },
    ".Tab:hover": { border: "2px solid #002395" },
    ".TabLabel--selected": { color: "#002395", fontWeight: "700" },
    ".Block": { borderRadius: "12px" },
  },
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface FormData {
  email: string;
  name: string;
  phone: string;
  zipCode: string;
  address: string;
  apt: string;
  city: string;
  region: string;
}

// ── Stripe form ───────────────────────────────────────────────────────────────
interface StripeFormProps {
  orderTotal: number;
  formData: FormData;
  onSuccess: (txId: string) => void;
  onError: (msg: string) => void;
  onBack: () => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
}

function StripePaymentForm({ orderTotal, formData, onSuccess, onError, onBack, loading, setLoading }: StripeFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!ready) setLoadError("Le chargement a pris trop de temps. Vérifiez votre connexion et réessayez.");
    }, 18000);
    return () => clearTimeout(timer);
  }, [ready]);

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
                line1: formData.address,
                line2: formData.apt || undefined,
                city: formData.city,
                state: formData.region,
                postal_code: formData.zipCode,
                country: "FR",
              },
            },
          },
        },
        redirect: "if_required",
      });

      if (error) {
        onError(error.message ?? "Erreur lors du paiement. Veuillez réessayer.");
      } else if (paymentIntent?.status === "succeeded") {
        onSuccess(paymentIntent.id);
      }
    } catch {
      onError("Impossible de se connecter au serveur de paiement. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  }, [stripe, elements, formData, onSuccess, onError, setLoading]);

  return (
    <div className="px-5 pt-5 pb-3">
      <h2 className="text-xl font-bold text-gray-900 mb-1">Paiement</h2>
      <p className="text-xs text-gray-400 mb-5">Transaction protégée par chiffrement SSL 256 bits.</p>

      {loadError ? (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-700 font-semibold mb-1">Impossible de charger les méthodes de paiement</p>
            <p className="text-sm text-red-600 mb-2">{loadError}</p>
            <button onClick={() => window.location.reload()} className="text-xs text-red-700 font-bold underline">
              Recharger la page
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className={`transition-all duration-300 ${ready ? "opacity-100" : "opacity-0 h-0 overflow-hidden"}`}>
            <PaymentElement
              onReady={() => setReady(true)}
              onLoadError={(e) => setLoadError(e.error?.message ?? "Erreur de chargement du formulaire.")}
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
              <span className="ml-2 text-sm text-gray-400">Chargement des méthodes de paiement…</span>
            </div>
          )}
        </>
      )}

      <div className="mt-5 border-t border-gray-100 pt-4 space-y-1.5 mb-5">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Livraison</span>
          <span className="text-green-600 font-semibold">Gratuite</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-2">
          <span className="font-black text-gray-900 text-base">Total TTC</span>
          <span className="font-black text-[#002395] text-xl">{orderTotal.toFixed(2).replace(".", ",")} {currencySymbol}</span>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <button type="button" onClick={onBack} disabled={loading}
          className="flex-shrink-0 px-5 py-4 rounded-full border-2 border-gray-300 text-gray-700 font-black text-sm hover:border-gray-400 transition-all disabled:opacity-40">
          RETOUR
        </button>
        <button type="button" onClick={handleSubmit} disabled={loading || !stripe || !ready}
          className="flex-1 bg-[#002395] hover:bg-[#001a70] disabled:opacity-60 text-white font-black text-base py-4 rounded-full flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
          {loading
            ? <><Loader2 className="w-5 h-5 animate-spin" /> Traitement en cours…</>
            : <>Finaliser la commande &rarr;</>
          }
        </button>
      </div>

      <p className="text-center text-[11px] text-gray-400 mb-2">{countryConfig.footerNote}</p>
      <div className="flex items-center justify-center gap-2 mb-3 text-gray-400">
        <Apple className="w-4 h-4" />
        <span className="text-[11px]">Apple Pay</span>
        <span className="text-gray-200">·</span>
        <span className="text-[11px]">Google Pay</span>
        <span className="text-gray-200">·</span>
        <span className="text-[11px]">Carte de crédit</span>
      </div>
      <p className="text-center text-[10px] text-gray-400">{countryConfig.companyInfo}<br />Licencié officiel FIFA World Cup 2026</p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function FranceCheckout() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const kitId = searchParams.get("kit") || "campeao";
  const kit = kits.find((k) => k.id === kitId) || kits[2];

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentDone, setPaymentDone] = useState(false);
  const [transactionID, setTransactionID] = useState<string | null>(null);
  const [selectedBumps, setSelectedBumps] = useState<Set<string>>(new Set());
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [intentError, setIntentError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    email: "", name: "", phone: "", zipCode: "", address: "", apt: "", city: "", region: "",
  });

  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [step]);

  // Detect Stripe 3DS redirect return
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirectStatus = params.get("redirect_status");
    const paymentIntentId = params.get("payment_intent");

    if (redirectStatus === "succeeded" && paymentIntentId) {
      const raw = sessionStorage.getItem("panini_fr_pending_order");
      sessionStorage.removeItem("panini_fr_pending_order");

      if (raw) {
        try {
          const order = JSON.parse(raw) as {
            kitId: string; orderTotal: number; bumps: string[];
            formData?: { email: string; name: string; address: string; city: string; zipCode: string; region: string; };
          };
          pixelPurchase({ content_ids: [order.kitId, ...order.bumps], value: order.orderTotal, currency: "EUR", num_items: 1 + order.bumps.length }, paymentIntentId);
          if (order.formData?.email) {
            const resolvedKit = kits.find(k => k.id === order.kitId) || kits[2];
            const items = [
              resolvedKit.name,
              ...order.bumps.map(bId => configBumps.find(b => b.id === bId)?.label ?? bId),
            ];
            fetch("/api/emails/trigger", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                paymentIntentId,
                customerEmail: order.formData.email,
                customerName: order.formData.name,
                address: order.formData.address,
                city: order.formData.city,
                postalCode: order.formData.zipCode,
                province: order.formData.region,
                country: "FR",
                amount: order.orderTotal,
                items,
              }),
            }).catch(() => {});
          }
        } catch { /* ignore */ }
      }

      setTransactionID(paymentIntentId);
      setPaymentDone(true);
      window.history.replaceState({}, "", `/france/checkout?kit=${kitId}`);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const bumpsTotal = configBumps.filter(b => selectedBumps.has(b.id)).reduce((s, b) => s + b.price, 0);
  const orderTotal = kit.price + bumpsTotal;

  const toggleBump = (id: string) => {
    setSelectedBumps(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Create PaymentIntent on step 3
  useEffect(() => {
    if (step !== 3 || clientSecret) return;
    setIntentError(null);

    fetch("/api/payment/create-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: orderTotal,
        currency: "eur",
        kitName: kit.name,
        payer: { email: formData.email, name: formData.name, document: "", phone: formData.phone },
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) { setIntentError(data.error); }
        else {
          setClientSecret(data.clientSecret);
          sessionStorage.setItem("panini_fr_pending_order", JSON.stringify({
            kitId: kit.id, orderTotal, bumps: Array.from(selectedBumps), formData,
          }));
          pixelInitiateCheckout({ content_ids: [kit.id], value: orderTotal, currency: "EUR", num_items: 1 + selectedBumps.size });
        }
      })
      .catch(() => setIntentError("Impossible de se connecter au serveur de paiement."));
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStepNext = (e: React.FormEvent) => { e.preventDefault(); setError(null); setStep(s => s + 1); };

  const handlePaymentSuccess = (txId: string) => {
    setTransactionID(txId);
    setPaymentDone(true);
    pixelPurchase({ content_ids: [kit.id, ...Array.from(selectedBumps)], value: orderTotal, currency: "EUR", num_items: 1 + selectedBumps.size }, txId);
    const items = [kit.name, ...configBumps.filter(b => selectedBumps.has(b.id)).map(b => b.label)];
    fetch("/api/emails/trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paymentIntentId: txId,
        customerEmail: formData.email,
        customerName: formData.name,
        address: formData.address,
        city: formData.city,
        postalCode: formData.zipCode,
        province: formData.region,
        country: "FR",
        amount: orderTotal,
        items,
      }),
    }).catch(() => {});
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (paymentDone) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center">
        <Header locale="fr" />
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
            <h1 className="text-2xl font-black text-gray-900 mb-2">Paiement effectué !</h1>
            <p className="text-gray-500 text-sm mb-6 max-w-xs">
              Merci pour votre commande. Vous recevrez un e-mail de confirmation avec les détails de livraison.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="w-full bg-white border border-gray-100 rounded-2xl p-5 mb-6 text-left shadow-sm">
            <h3 className="font-bold text-gray-900 text-sm mb-3 border-b pb-2">Récapitulatif de commande</h3>
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-gray-500">Produit</span>
              <span className="font-medium text-gray-900">{kit.name}</span>
            </div>
            {configBumps.filter(b => selectedBumps.has(b.id)).map(b => (
              <div key={b.id} className="flex justify-between mb-2 text-sm">
                <span className="text-gray-500 truncate pr-2">{b.label}</span>
                <span className="font-medium text-gray-900">+{currencySymbol}{b.price.toFixed(2).replace(".", ",")}</span>
              </div>
            ))}
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-gray-500">Livraison</span>
              <span className="font-medium text-green-600">Gratuite</span>
            </div>
            <div className="flex justify-between mb-2 text-sm border-t pt-2 mt-1">
              <span className="text-gray-500 font-bold">Total TTC</span>
              <span className="font-black text-[#002395]">{currencySymbol}{orderTotal.toFixed(2).replace(".", ",")}</span>
            </div>
            {transactionID && (
              <div className="flex justify-between text-xs mt-1">
                <span className="text-gray-400">Référence</span>
                <span className="text-gray-400 font-mono">{transactionID.slice(0, 20)}…</span>
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="w-full bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-left">
            <p className="text-xs font-bold text-blue-700 mb-1 uppercase tracking-wide">Prochaines étapes</p>
            <p className="text-sm text-blue-800">
              Vous recevrez un e-mail de confirmation à <strong>{formData.email}</strong>. {countryConfig.confirmationNote}
            </p>
          </motion.div>

          <button onClick={() => setLocation("/france")} className="text-[#002395] font-bold hover:underline text-sm">
            ← Retour à la boutique
          </button>
        </main>
      </div>
    );
  }

  // ── Checkout form ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pb-12">
      <Header locale="fr" />

      <main className="w-full max-w-5xl mx-auto px-4 pt-6 pb-4">

        {/* Stepper */}
        <div className="flex items-center justify-between px-2 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${step >= i ? "bg-[#002395] text-white" : "bg-gray-200 text-gray-400"}`}>
                {step > i ? <CheckCircle2 className="w-5 h-5" /> : i}
              </div>
              <span className={`ml-2 text-xs md:text-sm font-semibold ${step >= i ? "text-gray-900" : "text-gray-400"}`}>
                {i === 1 ? "Commande" : i === 2 ? "Livraison" : "Paiement"}
              </span>
              {i < 3 && <div className={`w-8 md:w-16 h-1 mx-2 rounded ${step > i ? "bg-[#002395]" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Order summary sidebar */}
          <div className="lg:col-span-5 lg:col-start-8 lg:row-start-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
              <div className="relative overflow-hidden bg-gray-50 border-b border-gray-100">
                <img src={kit.img} alt={kit.name} className="w-full h-28 lg:h-36 object-contain py-2 px-8" />
                <div className="absolute top-[28px] right-[-36px] w-[148px] text-center py-[5px] rotate-45 shadow-lg"
                  style={{ background: "linear-gradient(135deg, #f5a623 0%, #fbbf24 40%, #f5a623 100%)" }}>
                  <span className="text-[10px] font-black tracking-[0.18em] uppercase text-[#7c4a00]">Promotion</span>
                </div>
              </div>
              <div className="px-4 py-3">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="font-bold text-gray-900 text-sm">{kit.name}</p>
                  <span className="text-xs font-black text-[#002395]">{currencySymbol}{kit.price.toFixed(2).replace(".", ",")}</span>
                </div>
                <p className="text-xs text-gray-400 mb-1">{kit.contents}</p>
                <div className="flex items-center gap-1 text-yellow-500 text-xs mb-3">
                  ★★★★★ <span className="text-gray-400">4,9 · +2 000 avis</span>
                </div>
                <div className="space-y-1 border-t border-gray-100 pt-2">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Prix normal</span>
                    <span className="line-through">{currencySymbol}{kit.oldPrice.toFixed(2).replace(".", ",")}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Livraison</span>
                    <span className="text-green-600 font-semibold">Gratuite</span>
                  </div>
                  {configBumps.filter(b => selectedBumps.has(b.id)).map(b => (
                    <div key={b.id} className="flex justify-between text-xs text-gray-500">
                      <span className="truncate pr-2">{b.label}</span>
                      <span className="flex-shrink-0">+{currencySymbol}{b.price.toFixed(2).replace(".", ",")}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="font-bold text-gray-900 text-xs">Total TTC</span>
                    <span className="text-base font-black text-[#002395]">{currencySymbol}{orderTotal.toFixed(2).replace(".", ",")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main form area */}
          <div className="lg:col-span-7 lg:row-start-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

              {/* STEP 1 — Order / Bumps */}
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.form
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onSubmit={handleStepNext}
                    className="p-5"
                  >
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Votre commande</h2>

                    {/* Order bumps */}
                    {configBumps.length > 0 && (
                      <div className="mb-5">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                          Ajoutez plus de pochettes — Offre exclusive
                        </p>
                        <div className="space-y-3">
                          {configBumps.map((bump) => {
                            const selected = selectedBumps.has(bump.id);
                            return (
                              <button
                                key={bump.id}
                                type="button"
                                onClick={() => toggleBump(bump.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                                  selected ? "border-[#002395] bg-blue-50" : "border-gray-100 hover:border-gray-300"
                                }`}
                              >
                                <img src={bump.img} alt={bump.label} className="w-14 h-14 object-contain rounded-lg flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    {bump.badge && (
                                      <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wide ${bump.badge.cls}`}>
                                        {bump.badge.text}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs font-bold text-gray-900 truncate">{bump.label}</p>
                                  <p className="text-[11px] text-gray-400 leading-tight">{bump.desc}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-sm font-black text-[#002395]">+{currencySymbol}{bump.price.toFixed(2).replace(".", ",")}</span>
                                    <span className="text-xs text-gray-300 line-through">{currencySymbol}{bump.oldPrice.toFixed(2).replace(".", ",")}</span>
                                  </div>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                  selected ? "border-[#002395] bg-[#002395]" : "border-gray-300"
                                }`}>
                                  {selected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <button type="submit"
                      className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white font-black text-base py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                      Continuer vers la livraison <ChevronRight className="w-5 h-5" />
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                      <Lock className="w-3 h-3" /> Paiement sécurisé SSL
                    </p>
                  </motion.form>
                )}

                {/* STEP 2 — Delivery details */}
                {step === 2 && (
                  <motion.form
                    key="step2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onSubmit={handleStepNext}
                    className="p-5 space-y-4"
                  >
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Informations de livraison</h2>
                    <p className="text-xs text-gray-400 mb-4">{countryConfig.shippingDescription}</p>

                    {error && (
                      <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">{error}</span>
                      </div>
                    )}

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">E-mail *</label>
                      <input required type="email" name="email" value={formData.email} onChange={handleChange}
                        placeholder="vous@exemple.com"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#002395] focus:ring-2 focus:ring-[#002395]/10" />
                    </div>

                    {/* Name */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Nom complet *</label>
                      <input required type="text" name="name" value={formData.name} onChange={handleChange}
                        placeholder="Jean Dupont"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#002395] focus:ring-2 focus:ring-[#002395]/10" />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Téléphone *</label>
                      <input required type="tel" name="phone" value={formData.phone} onChange={handleChange}
                        placeholder={countryConfig.phonePlaceholder}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#002395] focus:ring-2 focus:ring-[#002395]/10" />
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Adresse *</label>
                      <input required type="text" name="address" value={formData.address} onChange={handleChange}
                        placeholder={countryConfig.addressPlaceholder}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#002395] focus:ring-2 focus:ring-[#002395]/10" />
                    </div>

                    {/* Apt */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{countryConfig.aptLabel}</label>
                      <input type="text" name="apt" value={formData.apt} onChange={handleChange}
                        placeholder={countryConfig.aptPlaceholder}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#002395] focus:ring-2 focus:ring-[#002395]/10" />
                    </div>

                    {/* Zip + City */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{countryConfig.zipLabel} *</label>
                        <input required type="text" name="zipCode" value={formData.zipCode} onChange={handleChange}
                          placeholder={countryConfig.zipPlaceholder} maxLength={countryConfig.zipMaxLength}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#002395] focus:ring-2 focus:ring-[#002395]/10" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Ville *</label>
                        <input required type="text" name="city" value={formData.city} onChange={handleChange}
                          placeholder={countryConfig.cityPlaceholder}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#002395] focus:ring-2 focus:ring-[#002395]/10" />
                      </div>
                    </div>

                    {/* Region */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{countryConfig.stateLabel} *</label>
                      <select required name="region" value={formData.region} onChange={handleChange}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#002395] focus:ring-2 focus:ring-[#002395]/10 bg-white">
                        <option value="">Sélectionnez votre région</option>
                        {countryConfig.stateList.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button type="button" onClick={() => setStep(1)}
                        className="flex-shrink-0 px-5 py-4 rounded-full border-2 border-gray-300 text-gray-700 font-black text-sm hover:border-gray-400 transition-all">
                        RETOUR
                      </button>
                      <button type="submit"
                        className="flex-1 bg-[#16a34a] hover:bg-[#15803d] text-white font-black text-base py-4 rounded-full flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                        Continuer vers le paiement <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-400 mt-2">
                      <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-green-500" /> Données protégées</span>
                      <span className="flex items-center gap-1"><Truck className="w-3 h-3 text-green-500" /> {countryConfig.shippingLabel}</span>
                    </div>
                  </motion.form>
                )}

                {/* STEP 3 — Payment */}
                {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                    {intentError ? (
                      <div className="p-5">
                        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm text-red-700 font-semibold mb-1">Erreur de connexion au paiement</p>
                            <p className="text-sm text-red-600 mb-3">{intentError}</p>
                            <button onClick={() => { setStep(2); setIntentError(null); }}
                              className="text-xs font-bold text-red-700 underline">
                              ← Retour
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : !clientSecret ? (
                      <div className="p-5 flex flex-col items-center justify-center py-16 gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-[#002395]" />
                        <p className="text-sm text-gray-400">Initialisation du paiement sécurisé…</p>
                      </div>
                    ) : (
                      <Elements stripe={stripePromise} options={{ clientSecret, appearance: stripeAppearance }}>
                        <StripePaymentForm
                          orderTotal={orderTotal}
                          formData={formData}
                          onSuccess={handlePaymentSuccess}
                          onError={(msg) => setError(msg)}
                          onBack={() => setStep(2)}
                          loading={loading}
                          setLoading={setLoading}
                        />
                      </Elements>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Trust strip */}
            <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs text-gray-400">
              <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-green-500" /> SSL 256 bits</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-green-500" /> Garantie 7 jours</span>
              <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-green-500" /> Livraison gratuite France</span>
              <span className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5 text-green-500" /> Produit officiel Panini</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
