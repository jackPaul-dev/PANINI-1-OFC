import { useEffect, useState } from "react";
import { ShieldCheck, Package, Truck, CheckCircle2 } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const STEPS = [
  { label: "Verifica disponibilità in Italia…", delay: 0 },
  { label: "Conferma stock in magazzino…", delay: 1200 },
  { label: "Prenotazione unità per la tua regione…", delay: 2400 },
  { label: "Accesso confermato!", delay: 3500 },
];

function goToStore() {
  window.location.href = BASE + "/?ref=pressel";
}

export default function Pressel() {
  const [stepIdx, setStepIdx] = useState(-1);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ttq) {
      (window as any).ttq.track("ViewContent", {
        content_name: "Verifica Panini Mondiale 2026",
        content_category: "Sports Collectibles",
      });
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    STEPS.forEach((s, i) => {
      timers.push(setTimeout(() => {
        setStepIdx(i);
        if (i === STEPS.length - 1) setDone(true);
      }, s.delay));
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  const progress = done ? 100 : stepIdx < 0 ? 0 : Math.round(((stepIdx + 1) / STEPS.length) * 92);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-28">

      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <span className="text-white text-base">⚽</span>
        </div>
        <div>
          <p className="text-sm font-black text-gray-900 leading-none">Panini Italia</p>
          <p className="text-[11px] text-gray-400">FIFA World Cup 2026™ · Edizione Ufficiale</p>
        </div>
        <div className="ml-auto flex items-center gap-1 text-xs text-green-600 font-semibold bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
          Disponibile
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center px-5 py-6">

        {/* Hero image — compact */}
        <div className="w-full max-w-sm mb-5">
          <div className="relative rounded-2xl overflow-hidden shadow-md bg-gray-200 h-36">
            <img src="/assets/caixa2.png" alt="Panini FIFA WC 2026"
              className="w-full h-full object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
              <div>
                <p className="text-white font-black text-base leading-tight">Album Panini · FIFA World Cup 2026™</p>
                <p className="text-white/70 text-xs">Distribuzione ufficiale in Italia</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="w-full max-w-sm bg-white border border-gray-200 rounded-3xl shadow-sm px-5 py-5 flex flex-col gap-4">

          <div className="text-center">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-0.5">Sistema di verifica</p>
            <h1 className="text-lg font-black text-gray-900">
              {done ? "✅ Accesso Consentito!" : "Verifica disponibilità…"}
            </h1>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Verifica</span>
              <span className="font-semibold text-primary">{progress}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-2.5">
            {STEPS.map((s, i) => {
              const active = i === stepIdx && !done;
              const complete = i < stepIdx || done;
              return (
                <div key={i}
                  className={`flex items-center gap-3 text-sm transition-all duration-300 ${i <= stepIdx ? "opacity-100" : "opacity-30"}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black border-2 transition-colors duration-300
                    ${complete ? "bg-primary border-primary text-white"
                      : active ? "bg-white border-primary text-primary"
                      : "bg-gray-100 border-gray-200 text-gray-400"}`}>
                    {complete ? "✓" : i + 1}
                  </span>
                  <span className={`${complete ? "text-gray-900 font-semibold" : active ? "text-primary font-semibold" : "text-gray-400"}`}>
                    {s.label}
                  </span>
                  {active && (
                    <svg className="w-4 h-4 text-primary animate-spin ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>

          {/* Inline confirmation badge */}
          {done && (
            <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 flex items-center gap-3">
              <CheckCircle2 className="w-7 h-7 text-green-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-black text-gray-900">Unità disponibili!</p>
                <p className="text-xs text-gray-500">Stock confermato · Spedizione gratuita inclusa</p>
              </div>
            </div>
          )}

          {!done && (
            <p className="text-xs text-gray-400 text-center">
              Attendi mentre verifichiamo la disponibilità…
            </p>
          )}

        </div>

        {/* Trust badges */}
        <div className="mt-5 flex items-center gap-5 text-xs text-gray-500">
          <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-primary" /> Pagamento sicuro</span>
          <span className="flex items-center gap-1"><Truck className="w-4 h-4 text-primary" /> Consegna Italia</span>
        </div>

      </main>

      {/* Sticky bottom CTA */}
      <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-5 py-4 shadow-2xl transition-all duration-500 ${done ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"}`}>
        <button
          onClick={goToStore}
          className="w-full bg-primary hover:brightness-110 active:scale-95 transition-all text-white font-black text-lg py-4 rounded-2xl shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
        >
          <Package className="w-5 h-5" />
          Accedi al negozio →
        </button>
        <p className="text-xs text-gray-400 text-center mt-1.5">Accesso riservato · Disponibile per un tempo limitato</p>
      </div>

    </div>
  );
}
