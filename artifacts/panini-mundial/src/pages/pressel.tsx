import { useEffect, useState } from "react";
import { ShieldCheck, Truck, Star, CheckCircle2, Package, Clock, Users } from "lucide-react";
import { pixelViewContent } from "@/lib/pixel";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const STEPS = [
  { label: "Verifica disponibilità in Italia…",      delay: 0    },
  { label: "Controlla stock per la tua regione…",   delay: 1100 },
  { label: "Conferma unità disponibili…",            delay: 2200 },
  { label: "✅ Stock confermato!",                   delay: 3100 },
];

const REVIEWS = [
  { name: "Marco T., Milano",       stars: 5, text: "Ho preso il kit per mio figlio, è arrivato in 2 giorni. Le figurine sono bellissime, edizione ufficiale come promesso." },
  { name: "Silvia R., Roma",        stars: 5, text: "Finalmente il vero album ufficiale! Mio nipote è impazzito di gioia. Consegna rapida e imballaggio perfetto." },
  { name: "Giuseppe M., Napoli",    stars: 5, text: "Qualità eccezionale. Ho già completato metà album in una settimana. Lo consiglio a tutti i tifosi!" },
];

function goToStore() {
  window.location.href = BASE + "/?ref=presell";
}

export default function Pressel() {
  const [stepIdx, setStepIdx] = useState(-1);
  const [done, setDone]       = useState(false);
  const [stock]               = useState(() => Math.floor(Math.random() * 8) + 4); // 4–11

  useEffect(() => {
    pixelViewContent({
      content_ids: ["panini-mundial-2026-presell"],
      content_name: "Panini Mondiale 2026 — Presell",
      value: 39.99,
      currency: "EUR",
    });

    const timers: ReturnType<typeof setTimeout>[] = [];
    STEPS.forEach((s, i) =>
      timers.push(setTimeout(() => {
        setStepIdx(i);
        if (i === STEPS.length - 1) setDone(true);
      }, s.delay))
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const progress = done ? 100 : stepIdx < 0 ? 2 : Math.round(((stepIdx + 1) / STEPS.length) * 90);

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex flex-col pb-32">

      {/* Top bar */}
      <div className="bg-primary text-white text-center py-2 text-xs font-semibold tracking-wide">
        🔥 Edizione Ufficiale FIFA World Cup 2026™ · Spedizione Gratuita
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 shadow-sm">
        <img src="/assets/logo-panini-oficial.png" alt="Panini" className="h-8 object-contain" />
        <div className="ml-auto text-right">
          <p className="text-[11px] text-gray-400">Distribuzione Ufficiale</p>
          <p className="text-xs font-bold text-gray-700">panini-it.site</p>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 py-5 gap-5 max-w-md mx-auto w-full">

        {/* Article tag */}
        <div className="w-full flex items-center gap-2">
          <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wide">Esclusiva</span>
          <span className="text-xs text-gray-400">Sport · Collezionismo · FIFA 2026</span>
        </div>

        {/* Headline */}
        <div className="w-full">
          <h1 className="text-2xl font-black text-gray-900 leading-tight mb-2">
            L'Album Ufficiale Panini del Mondiale 2026 È Già Sold Out Nei Negozi — Ma Puoi Ancora Ordinarlo Online
          </h1>
          <p className="text-sm text-gray-500">
            La domanda ha superato ogni previsione. I kit esclusivi con bustine sigillate sono disponibili solo tramite distribuzione online ufficiale.
          </p>
        </div>

        {/* Hero image */}
        <div className="w-full rounded-2xl overflow-hidden shadow-md relative">
          <img src="/assets/caixa2.png" alt="Kit Panini FIFA WC 2026"
            className="w-full h-52 object-cover object-center" />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <p className="text-white text-xs font-semibold">Album Panini · FIFA World Cup 2026™ · Edizione Ufficiale</p>
          </div>
        </div>

        {/* Body copy */}
        <div className="w-full text-sm text-gray-700 space-y-3 leading-relaxed">
          <p>
            Il Campionato del Mondo 2026 negli USA, Canada e Messico si avvicina — e con lui, l'album ufficiale Panini più atteso degli ultimi decenni.
            Con <strong>48 nazioni partecipanti</strong> e oltre <strong>700 figurine collezionabili</strong>, questa edizione è già storia del collezionismo sportivo.
          </p>
          <p>
            I kit disponibili online includono l'album in copertina rigida e confezioni di bustine sigillate in fabbrica, con spedizione diretta dall'Italia.
          </p>
        </div>

        {/* Stock verification card */}
        <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-5">

          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Verifica disponibilità</p>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
              <span>Stock Italia</span>
              <span className="font-bold text-primary">{progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-2.5 mb-4">
            {STEPS.map((s, i) => {
              const complete = i < stepIdx || done;
              const active   = i === stepIdx && !done;
              return (
                <div key={i}
                  className={`flex items-center gap-3 text-sm transition-all duration-300 ${i <= stepIdx ? "opacity-100" : "opacity-25"}`}>
                  <span className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-black border-2 transition-colors
                    ${complete ? "bg-primary border-primary text-white" : active ? "border-primary text-primary bg-white" : "border-gray-200 text-gray-300 bg-gray-50"}`}>
                    {complete ? "✓" : i + 1}
                  </span>
                  <span className={complete ? "text-gray-900 font-semibold" : active ? "text-primary font-semibold" : "text-gray-400"}>
                    {s.label}
                  </span>
                  {active && (
                    <svg className="w-3.5 h-3.5 text-primary animate-spin ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>

          {/* Result */}
          {done ? (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-black text-gray-900">
                  {stock} {stock === 1 ? "unità disponibile" : "unità disponibili"} nella tua area
                </p>
                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Riservata per i prossimi <strong>10 minuti</strong>
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center">Attendere il completamento della verifica…</p>
          )}
        </div>

        {/* Social proof */}
        <div className="w-full flex items-center gap-2 text-xs text-gray-500 justify-center">
          <Users className="w-4 h-4 text-primary" />
          <span><strong className="text-gray-800">2.847 persone</strong> hanno già ordinato questo mese</span>
        </div>

        {/* Reviews */}
        <div className="w-full space-y-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Recensioni verificate</p>
          {REVIEWS.map((r, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
              <div className="flex items-center gap-1 mb-1">
                {Array.from({ length: r.stars }).map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                ))}
                <span className="ml-1 text-xs text-gray-400">{r.name}</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">"{r.text}"</p>
            </div>
          ))}
        </div>

        {/* Trust strip */}
        <div className="w-full flex justify-around text-xs text-gray-500 py-2">
          <span className="flex flex-col items-center gap-1">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Pagamento sicuro
          </span>
          <span className="flex flex-col items-center gap-1">
            <Truck className="w-5 h-5 text-primary" />
            Spedizione gratis
          </span>
          <span className="flex flex-col items-center gap-1">
            <Package className="w-5 h-5 text-primary" />
            Reso garantito
          </span>
        </div>

      </main>

      {/* Sticky CTA */}
      <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 shadow-2xl transition-all duration-500
        ${done ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"}`}>
        <button
          onClick={goToStore}
          className="w-full bg-primary hover:brightness-110 active:scale-[0.98] transition-all text-white font-black text-lg py-4 rounded-2xl shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
        >
          <Package className="w-5 h-5" />
          Scegli il Tuo Kit →
        </button>
        <div className="flex items-center justify-center gap-4 mt-2 text-[11px] text-gray-400">
          <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> 100% Sicuro</span>
          <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> Spedizione gratuita</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Offerta limitata</span>
        </div>
      </div>

    </div>
  );
}
