import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Package, Search, AlertCircle, Loader2 } from "lucide-react";

interface OrderEmailRecord {
  day: number;
  subject: string;
  status: string;
  scheduledAt: string | null;
  sentAt: string;
}

interface OrderData {
  orderId: string;
  customerName: string;
  city: string;
  createdAt: string;
  amount: number;
  items: string[];
  emails: OrderEmailRecord[];
}

const STEPS = [
  { day: 0,  label: "Conferma dell'ordine",       sublabel: "Ordine elaborato con successo" },
  { day: 1,  label: "Ordine in viaggio",           sublabel: "Partito dal magazzino" },
  { day: 2,  label: "Centro di distribuzione",     sublabel: "Arrivato all'hub logistico" },
  { day: 3,  label: "In consegna nella tua città", sublabel: "Corriere in zona" },
  { day: 5,  label: "Primo tentativo di consegna", sublabel: "Piccolo ritardo in corso" },
  { day: 6,  label: "Localizzazione in corso",     sublabel: "Segnale in recupero" },
  { day: 7,  label: "Controllo doganale",          sublabel: "In revisione standard" },
  { day: 8,  label: "Verifica dell'indirizzo",     sublabel: "In attesa di conferma" },
  { day: 9,  label: "Ordine rilanciato",           sublabel: "Nuovo percorso assegnato" },
  { day: 10, label: "Consegna imminente",          sublabel: "Corriere in arrivo" },
];

const OFFSETS = [0, 1, 2, 3, 5, 6, 7, 8, 9, 10];

function getActiveStep(createdAt: string): number {
  const elapsed = (Date.now() - new Date(createdAt).getTime()) / 86400000;
  let active = 0;
  for (let i = 0; i < OFFSETS.length; i++) {
    if (elapsed >= OFFSETS[i]) active = i;
    else break;
  }
  return Math.min(active, STEPS.length - 1);
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
}
function fmtShort(d: Date) {
  return d.toLocaleDateString("it-IT", { day: "numeric", month: "short" }) +
    " " + d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
}

export default function Seguimiento() {
  const [inputId, setInputId] = useState("");
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  // Auto-load from URL param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("orderId");
    if (orderId) {
      setInputId(orderId);
      fetchOrder(orderId);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function fetchOrder(id: string) {
    const clean = id.trim().toUpperCase();
    if (!clean) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    fetch(`/api/orders/${clean}`)
      .then(r => {
        if (!r.ok) throw new Error("Ordine non trovato");
        return r.json();
      })
      .then((data: OrderData) => { setOrder(data); setLoading(false); })
      .catch(e => { setError(e.message); setOrder(null); setLoading(false); });
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(inputId);
  };

  const activeStep = order ? getActiveStep(order.createdAt) : 0;
  const base = order ? new Date(order.createdAt).getTime() : 0;

  return (
    <div className="min-h-screen bg-[#efefef] font-sans">
      {/* Header */}
      <div className="bg-black text-white text-center py-5 px-4">
        <p className="text-xs text-gray-400 tracking-widest uppercase mb-1">Panini Italia</p>
        <h1 className="text-2xl font-black tracking-widest uppercase">TRACCIAMENTO</h1>
        <p className="text-xs text-gray-500 tracking-wider uppercase mt-1">Mondiali 2026</p>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Search box */}
        <form onSubmit={handleSearch} className="bg-white border border-gray-200 p-6 mb-6">
          <label className="block text-[10px] font-semibold text-gray-400 tracking-widest uppercase mb-3">
            Codice ordine
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputId}
              onChange={e => setInputId(e.target.value.toUpperCase())}
              placeholder="PAN-XXXXXX"
              className="flex-1 border border-gray-300 px-4 py-3 text-sm font-mono tracking-wider uppercase placeholder-gray-300 focus:outline-none focus:border-black"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white px-5 py-3 flex items-center gap-2 text-sm font-semibold hover:bg-gray-900 disabled:opacity-50 transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span className="hidden sm:inline">Cerca</span>
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-3">
            Trovi il codice nell'email di conferma ricevuta dopo l'acquisto
          </p>
        </form>

        {/* Error */}
        {error && searched && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-red-200 p-5 mb-6 flex gap-3 items-start"
          >
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-900">Ordine non trovato</p>
              <p className="text-xs text-gray-500 mt-1">Verifica il codice e riprova. Il codice si trova nell'email di conferma.</p>
            </div>
          </motion.div>
        )}

        {/* Order found */}
        {order && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>

            {/* Order header */}
            <div className="bg-black text-white p-6 mb-4">
              <p className="text-[9px] text-gray-400 tracking-widest uppercase mb-1">Codice ordine</p>
              <p className="font-mono text-2xl font-bold tracking-widest">{order.orderId}</p>
              <p className="text-xs text-gray-500 mt-2">{fmtShort(new Date(order.createdAt))}</p>
            </div>

            {/* Customer + items */}
            <div className="bg-white border border-gray-200 p-6 mb-4">
              <div className="flex items-start gap-3 mb-4 pb-4 border-b border-gray-100">
                <Package className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Destinatario</p>
                  <p className="text-sm font-semibold text-gray-900">{order.customerName}</p>
                  <p className="text-xs text-gray-500">{order.city}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Totale</p>
                  <p className="text-lg font-bold text-gray-900">€ {order.amount.toFixed(2).replace(".", ",")}</p>
                </div>
              </div>
              {order.items.length > 0 && (
                <div>
                  <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-3">Articoli</p>
                  <ul className="space-y-2">
                    {order.items.map((item, i) => (
                      <li key={i} className="flex gap-2 text-xs text-gray-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="bg-white border border-gray-200 p-6 mb-4">
              <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-6">
                Stato della spedizione
              </p>

              <div className="space-y-0">
                {STEPS.map((step, i) => {
                  const done   = i < activeStep;
                  const active = i === activeStep;
                  const pending = i > activeStep;
                  const stepDate = new Date(base + OFFSETS[i] * 86400000);
                  const isLast = i === STEPS.length - 1;

                  return (
                    <div key={i} className="flex gap-4">
                      {/* Dot + line */}
                      <div className="flex flex-col items-center">
                        <div className={`
                          flex items-center justify-center rounded-full shrink-0 z-10
                          ${done   ? "w-6 h-6 bg-black text-white" : ""}
                          ${active ? "w-6 h-6 bg-white border-2 border-black text-black" : ""}
                          ${pending ? "w-6 h-6 bg-gray-200 text-gray-400" : ""}
                        `}>
                          {done ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : active ? (
                            <Circle className="w-2.5 h-2.5 fill-black" />
                          ) : (
                            <span className="text-[9px] font-bold">{i + 1}</span>
                          )}
                        </div>
                        {!isLast && (
                          <div className={`w-px flex-1 my-1 ${done ? "bg-black" : "bg-gray-200"}`} style={{ minHeight: 28 }} />
                        )}
                      </div>

                      {/* Content */}
                      <div className={`pb-7 ${isLast ? "pb-0" : ""}`}>
                        <p className={`text-[11px] font-semibold uppercase tracking-wide leading-tight
                          ${done || active ? "text-gray-900" : "text-gray-400"}`}>
                          {step.label}
                        </p>
                        {done && (
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            Completato · {fmtDate(stepDate)}
                          </p>
                        )}
                        {active && (
                          <p className="text-[10px] text-black font-semibold mt-0.5 flex items-center gap-1">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                            In corso — {step.sublabel}
                          </p>
                        )}
                        {pending && (
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            Previsto: {fmtDate(stepDate)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Help note */}
            <div className="bg-white border border-gray-100 px-6 py-4 text-center">
              <p className="text-[10px] text-gray-400 leading-relaxed">
                Riceverai aggiornamenti via email ad ogni cambio di stato.<br />
                Per assistenza contatta il nostro supporto clienti.
              </p>
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {!order && !error && !loading && !searched && (
          <div className="bg-white border border-gray-200 p-10 text-center">
            <Package className="w-10 h-10 text-gray-300 mx-auto mb-4" />
            <p className="text-sm font-semibold text-gray-700 mb-1">Traccia il tuo ordine</p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Inserisci il codice ordine ricevuto nell'email di conferma<br />
              per vedere lo stato della tua spedizione.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-8 px-4">
        <p className="text-[9px] text-gray-400 tracking-widest uppercase">
          © {new Date().getFullYear()} Panini Italia Srl · Tutti i diritti riservati
        </p>
      </div>
    </div>
  );
}
