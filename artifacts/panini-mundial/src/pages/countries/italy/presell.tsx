import { useEffect, useState } from "react";
import { Star, Package, ShieldCheck, Truck } from "lucide-react";
import { pixelViewContent } from "@/lib/pixel";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const STEPS = [
  { label: "Verifica utente reale…",           delay: 0    },
  { label: "Validazione accesso esclusivo…",   delay: 1400 },
  { label: "Preparazione sconti e prodotti…",  delay: 2700 },
];

const STATUS_MESSAGES = [
  "Verifica profilo…",
  "Accesso in elaborazione…",
  "Caricamento offerte…",
  "Accesso confermato!",
];

function goToStore() {
  window.location.href = BASE + "/?ref=presell";
}

export default function Pressel() {
  const [stepIdx, setStepIdx]   = useState(-1);
  const [done, setDone]         = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    pixelViewContent({
      content_ids: ["panini-mundial-2026-presell"],
      content_name: "Panini Mondiale 2026 — Presell",
      value: 39.99,
      currency: "EUR",
    });

    // Animate progress bar smoothly
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); return 100; }
        const increment = p < 30 ? 3 : p < 70 ? 1.5 : p < 90 ? 0.8 : 0.3;
        return Math.min(p + increment, 100);
      });
    }, 60);

    const t1 = setTimeout(() => setStepIdx(0), 0);
    const t2 = setTimeout(() => setStepIdx(1), 1400);
    const t3 = setTimeout(() => setStepIdx(2), 2700);
    const t4 = setTimeout(() => { setDone(true); setProgress(100); }, 4000);

    return () => { clearInterval(interval); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  const statusMsg = done
    ? STATUS_MESSAGES[3]
    : stepIdx < 0
    ? STATUS_MESSAGES[0]
    : STATUS_MESSAGES[Math.min(stepIdx + 1, 2)];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f5f5f5" }}>

      {/* Top bar — dark maroon */}
      <div style={{ background: "#5c1212" }} className="py-3 flex items-center justify-center">
        <div className="flex items-center gap-2 border border-white/30 rounded-full px-4 py-1.5">
          <span className="text-white text-sm">🔒</span>
          <span className="text-white text-sm font-semibold">Area di Accesso Riservato</span>
        </div>
      </div>

      {/* Status bar */}
      <div style={{ background: "#3a0c0c" }} className="py-2 flex items-center justify-center gap-6">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse inline-block" />
          <span className="text-white/80 text-xs font-medium">Validazione in corso</span>
        </div>
        <span className="text-white/30 text-xs">|</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
          <span className="text-white/80 text-xs font-medium">Stock limitato</span>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 py-10 gap-6">

        {/* Badge */}
        <div
          className="px-4 py-1.5 rounded-full text-white text-xs font-black tracking-widest uppercase"
          style={{ background: "#5c1212" }}
        >
          FIFA WORLD CUP 2026
        </div>

        {/* Headline */}
        <div className="text-center">
          <h1 className="text-2xl font-black text-gray-900 leading-tight mb-2">
            {done ? "✅ Accesso Confermato!" : "Verifica il tuo\naccesso esclusivo"}
          </h1>
          <p className="text-sm text-gray-500">
            {done
              ? "Il tuo accesso all'offerta esclusiva è stato confermato"
              : "Per favore attendi mentre verifichiamo il tuo profilo"}
          </p>
        </div>

        {/* Verification card */}
        <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

          {/* Steps */}
          <div className="px-5 pt-5 pb-4 space-y-3">
            {STEPS.map((s, i) => {
              const isActive  = i === stepIdx && !done;
              const isComplete = done || i < stepIdx;
              const isPending  = !done && i > stepIdx;

              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300
                    ${isActive ? "bg-gray-50 border border-gray-200" : "bg-transparent"}`}
                >
                  {/* Circle indicator */}
                  <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all
                    ${isComplete ? "border-green-500 bg-green-500" : isActive ? "border-[#5c1212] bg-white" : "border-gray-200 bg-white"}`}>
                    {isComplete ? (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : isActive ? (
                      <svg className="w-3 h-3 text-[#5c1212] animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                    ) : null}
                  </div>

                  <span className={`text-sm transition-all ${isComplete ? "text-gray-900 font-semibold" : isActive ? "text-gray-900 font-semibold" : "text-gray-300"}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="px-5 pb-5">
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, background: "#5c1212" }}
              />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">{statusMsg}</span>
              <span className="font-bold" style={{ color: "#5c1212" }}>{Math.round(progress)}%</span>
            </div>
          </div>
        </div>

        {/* Social proof */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />)}
          </div>
          <p className="text-sm text-gray-500">+2.847 famiglie italiane hanno già ordinato</p>
        </div>

        {/* CTA — visible only after done */}
        {done && (
          <div className="w-full max-w-sm space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
              onClick={goToStore}
              className="w-full text-white font-black text-lg py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              style={{ background: "#16a34a", boxShadow: "0 8px 24px rgba(22,163,74,0.35)" }}
            >
              <Package className="w-5 h-5" />
              Scegli il Tuo Kit →
            </button>
            <div className="flex items-center justify-center gap-5 text-xs text-gray-400">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Pagamento sicuro</span>
              <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Spedizione gratuita</span>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
