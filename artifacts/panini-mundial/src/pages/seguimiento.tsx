import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, AlertCircle, Loader2, Package, MapPin, CalendarDays } from "lucide-react";

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
  { label: "Conferma dell'ordine",       sub: "Ordine elaborato con successo",           icon: "✓" },
  { label: "Ordine in viaggio",           sub: "Partito dal magazzino",                  icon: "📦" },
  { label: "Centro di distribuzione",     sub: "Arrivato all'hub logistico",             icon: "🏭" },
  { label: "In consegna nella tua città", sub: "Corriere in zona",                       icon: "🚚" },
  { label: "Primo tentativo di consegna", sub: "Piccolo ritardo in corso",               icon: "⚠️" },
  { label: "Localizzazione in corso",     sub: "Segnale in recupero",                    icon: "🔍" },
  { label: "Controllo doganale",          sub: "In revisione standard",                  icon: "📋" },
  { label: "Verifica dell'indirizzo",     sub: "In attesa di conferma",                  icon: "📍" },
  { label: "Ordine rilanciato",           sub: "Nuovo percorso assegnato",               icon: "✅" },
  { label: "Consegna imminente",          sub: "Corriere in arrivo",                     icon: "🎉" },
];
const OFFSETS = [0, 1, 2, 3, 5, 6, 7, 8, 9, 10];

/* If ?step=N is in URL use that, else calculate from time */
function resolveActiveStep(createdAt: string, urlStep: number | null): number {
  if (urlStep !== null && urlStep >= 0 && urlStep < STEPS.length) return urlStep;
  const elapsed = (Date.now() - new Date(createdAt).getTime()) / 86400000;
  let active = 0;
  for (let i = 0; i < OFFSETS.length; i++) {
    if (elapsed >= OFFSETS[i]) active = i;
    else break;
  }
  return Math.min(active, STEPS.length - 1);
}

function fmtFull(d: Date) {
  return d.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
function fmtShort(d: Date) {
  return d.toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" }) +
    " · " + d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
}

const BURGUNDY = "#6b0f1a";
const GREEN    = "#16a34a";
const AMBER    = "#f5a623";

export default function Seguimiento() {
  const [inputId, setInputId]   = useState("");
  const [order, setOrder]       = useState<OrderData | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [urlStep, setUrlStep]   = useState<number | null>(null);

  useEffect(() => {
    const params  = new URLSearchParams(window.location.search);
    const orderId = params.get("orderId");
    const step    = params.get("step");
    if (step !== null) setUrlStep(parseInt(step, 10));
    if (orderId) {
      setInputId(orderId.toUpperCase());
      fetchOrder(orderId, step !== null ? parseInt(step, 10) : null);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function fetchOrder(id: string, step: number | null = urlStep) {
    const clean = id.trim().toUpperCase();
    if (!clean) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    fetch(`/api/orders/${clean}`)
      .then(r => { if (!r.ok) throw new Error("Ordine non trovato"); return r.json(); })
      .then((data: OrderData) => { setOrder(data); setUrlStep(step); setLoading(false); })
      .catch(e => { setError(e.message); setOrder(null); setLoading(false); });
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(inputId, null);
  };

  const activeStep = order ? resolveActiveStep(order.createdAt, urlStep) : 0;
  const base = order ? new Date(order.createdAt).getTime() : 0;

  return (
    <div style={{ minHeight: "100vh", background: "#f0ece8", fontFamily: "-apple-system,Helvetica,Arial,sans-serif" }}>

      {/* ── BURGUNDY HEADER ── */}
      <div style={{ background: BURGUNDY }}>
        {/* Gold top line */}
        <div style={{ height: 4, background: `linear-gradient(90deg,${AMBER},#d4880a,${AMBER})` }} />
        <div style={{ textAlign: "center", padding: "24px 20px 20px" }}>
          <img
            src="/assets/logo-panini-oficial.png"
            alt="Panini"
            style={{ height: 52, width: "auto", display: "block", margin: "0 auto 12px" }}
          />
          <div style={{
            display: "inline-block",
            background: "rgba(255,255,255,0.12)",
            borderRadius: 20,
            padding: "5px 18px",
            fontSize: 9,
            fontWeight: 700,
            color: "rgba(255,255,255,0.85)",
            letterSpacing: "0.22em",
            textTransform: "uppercase" as const,
          }}>
            Tracciamento Ordine · FIFA World Cup 26™
          </div>
        </div>
        {/* Gold bottom line */}
        <div style={{ height: 3, background: `linear-gradient(90deg,${AMBER},#d4880a,${AMBER})` }} />
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "28px 16px 60px" }}>

        {/* Search box */}
        <form onSubmit={handleSearch} style={{ background: "#fff", border: "1px solid #e8e0d8", borderRadius: 4, padding: "24px 28px", marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: "#aaa", textTransform: "uppercase" as const, letterSpacing: "0.22em", marginBottom: 10 }}>
            Inserisci il codice ordine
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              value={inputId}
              onChange={e => setInputId(e.target.value.toUpperCase())}
              placeholder="PAN-XXXXXX"
              style={{
                flex: 1, border: "1px solid #ddd", padding: "12px 16px",
                fontSize: 14, fontFamily: "'Courier New',monospace", letterSpacing: "0.12em",
                textTransform: "uppercase" as const, outline: "none", borderRadius: 3,
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                background: GREEN, color: "#fff", border: "none", padding: "12px 20px",
                fontSize: 13, fontWeight: 700, cursor: "pointer", borderRadius: 3,
                display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" as const,
              }}
            >
              {loading ? <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} /> : <Search style={{ width: 16, height: 16 }} />}
              <span>Cerca</span>
            </button>
          </div>
          <p style={{ margin: "10px 0 0", fontSize: 10, color: "#bbb" }}>
            Trovi il codice nell'email di conferma ricevuta dopo l'acquisto
          </p>
        </form>

        {/* Error */}
        {error && searched && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: "#fff8f3", border: "1px solid #f5d5c0", borderRadius: 4, padding: "16px 20px", marginBottom: 20, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <AlertCircle style={{ width: 18, height: 18, color: BURGUNDY, flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: BURGUNDY }}>Ordine non trovato</p>
              <p style={{ margin: "4px 0 0", fontSize: 11, color: "#888" }}>Verifica il codice e riprova. Lo trovi nell'email di conferma Panini.</p>
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {!order && !error && !loading && !searched && (
          <div style={{ background: "#fff", border: "1px solid #e8e0d8", borderRadius: 4, padding: "48px 28px", textAlign: "center" }}>
            <Package style={{ width: 48, height: 48, color: "#d8cfc8", margin: "0 auto 16px", display: "block" }} />
            <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: BURGUNDY }}>Traccia il tuo ordine Panini</p>
            <p style={{ margin: 0, fontSize: 12, color: "#aaa", lineHeight: 1.6 }}>
              Inserisci il codice ordine ricevuto nell'email di conferma<br />
              per vedere lo stato della tua spedizione in tempo reale.
            </p>
          </div>
        )}

        {/* Order found */}
        {order && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>

            {/* Order code hero */}
            <div style={{ background: "#fff8f3", border: `2px solid ${AMBER}`, borderRadius: 4, padding: "22px 28px", marginBottom: 16, textAlign: "center" }}>
              <p style={{ margin: "0 0 4px", fontSize: 9, color: "#aaa", textTransform: "uppercase" as const, letterSpacing: "0.22em" }}>Codice ordine</p>
              <p style={{ margin: "0 0 6px", fontFamily: "'Courier New',monospace", fontSize: 30, fontWeight: 700, color: BURGUNDY, letterSpacing: "0.16em" }}>{order.orderId}</p>
              <p style={{ margin: 0, fontSize: 10, color: "#bbb", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                <CalendarDays style={{ width: 11, height: 11 }} />
                {fmtShort(new Date(order.createdAt))}
              </p>
            </div>

            {/* Customer + items */}
            <div style={{ background: "#fff", border: "1px solid #e8e0d8", borderRadius: 4, padding: "20px 28px", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, paddingBottom: 16, borderBottom: "1px solid #f0ebe8", marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, background: "#fdf5f0", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Package style={{ width: 18, height: 18, color: BURGUNDY }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 2px", fontSize: 9, color: "#bbb", textTransform: "uppercase" as const, letterSpacing: "0.18em" }}>Destinatario</p>
                  <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700, color: BURGUNDY }}>{order.customerName}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#888", display: "flex", alignItems: "center", gap: 4 }}>
                    <MapPin style={{ width: 10, height: 10 }} /> {order.city}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: "0 0 2px", fontSize: 9, color: "#bbb", textTransform: "uppercase" as const, letterSpacing: "0.18em" }}>Totale</p>
                  <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: BURGUNDY }}>€ {order.amount.toFixed(2).replace(".", ",")}</p>
                </div>
              </div>

              {order.items.length > 0 && (
                <div>
                  <p style={{ margin: "0 0 12px", fontSize: 9, color: "#bbb", textTransform: "uppercase" as const, letterSpacing: "0.18em" }}>Articoli dell'ordine</p>
                  <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                    {order.items.map((item, i) => (
                      <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 0", borderBottom: i < order.items.length - 1 ? "1px solid #f5f0ec" : "none" }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: AMBER, marginTop: 5, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: "#333", lineHeight: 1.5 }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div style={{ background: "#fdfaf8", border: "1px solid #e8e0d8", borderRadius: 4, padding: "24px 28px", marginBottom: 16 }}>
              <p style={{ margin: "0 0 22px", fontSize: 9, color: "#bbb", textTransform: "uppercase" as const, letterSpacing: "0.2em" }}>
                Stato della tua spedizione
              </p>

              {STEPS.map((step, i) => {
                const done    = i < activeStep;
                const active  = i === activeStep;
                const pending = i > activeStep;
                const stepDate = new Date(base + OFFSETS[i] * 86400000);
                const isLast  = i === STEPS.length - 1;

                return (
                  <div key={i} style={{ display: "flex", gap: 16 }}>
                    {/* Dot + line column */}
                    <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", width: 28 }}>
                      {/* Dot */}
                      <div style={{
                        width: done || pending ? 24 : 22,
                        height: done || pending ? 24 : 22,
                        borderRadius: "50%",
                        background: done ? GREEN : active ? "#fff" : "#e8e8e8",
                        border: active ? `2px solid ${BURGUNDY}` : "none",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, zIndex: 1,
                        fontSize: done ? 11 : 10,
                        fontWeight: 700,
                        color: done ? "#fff" : active ? BURGUNDY : "#bbb",
                        boxShadow: active ? `0 0 0 3px rgba(107,15,26,0.12)` : "none",
                      }}>
                        {done ? "✓" : String(i + 1)}
                      </div>
                      {/* Connector line */}
                      {!isLast && (
                        <div style={{
                          width: 2, flex: 1, minHeight: 28, marginTop: 2,
                          background: done ? GREEN : "#e8e8e8",
                          borderRadius: 1,
                        }} />
                      )}
                    </div>

                    {/* Content */}
                    <div style={{ paddingBottom: isLast ? 0 : 24, flex: 1 }}>
                      <p style={{
                        margin: "0 0 3px",
                        fontSize: 11,
                        fontWeight: done || active ? 700 : 400,
                        color: done ? GREEN : active ? BURGUNDY : "#ccc",
                        textTransform: "uppercase" as const,
                        letterSpacing: "0.07em",
                        lineHeight: 1.3,
                      }}>
                        {step.label}
                      </p>

                      {done && (
                        <p style={{ margin: 0, fontSize: 10, color: "#999" }}>
                          Completato · {fmtFull(stepDate)}
                        </p>
                      )}
                      {active && (
                        <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: BURGUNDY, display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: BURGUNDY, animation: "pulse 1.5s infinite" }} />
                          In corso — {step.sub}
                        </p>
                      )}
                      {pending && (
                        <p style={{ margin: 0, fontSize: 10, color: "#ccc" }}>
                          Previsto: {fmtFull(stepDate)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Status banner */}
            <div style={{ background: BURGUNDY, borderRadius: 4, padding: "16px 28px", textAlign: "center", marginBottom: 16 }}>
              <p style={{ margin: "0 0 4px", fontSize: 9, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" as const, letterSpacing: "0.2em" }}>Stato attuale</p>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#fff", letterSpacing: "0.05em" }}>
                {STEPS[activeStep]?.label.toUpperCase()} {order.city ? `· ${order.city.toUpperCase()}` : ""}
              </p>
            </div>

            {/* Help note */}
            <div style={{ background: "#fff", border: "1px solid #e8e0d8", borderRadius: 4, padding: "14px 28px", textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 10, color: "#bbb", lineHeight: 1.7 }}>
                Riceverai aggiornamenti via email ad ogni cambio di stato.<br />
                Per assistenza: <span style={{ color: BURGUNDY, fontWeight: 600 }}>assistenza@panini-it.site</span>
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div style={{ background: BURGUNDY, padding: "0" }}>
        <div style={{ height: 3, background: `linear-gradient(90deg,${AMBER},#d4880a,${AMBER})` }} />
        <div style={{ textAlign: "center", padding: "20px 20px 24px" }}>
          <img src="/assets/logo-panini-oficial.png" alt="Panini"
            style={{ height: 32, width: "auto", display: "block", margin: "0 auto 10px", opacity: 0.6 }} />
          <p style={{ margin: "0 0 4px", fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em", textTransform: "uppercase" as const }}>
            Panini Italia Srl · Licenziatario Ufficiale FIFA
          </p>
          <p style={{ margin: 0, fontSize: 9, color: "rgba(255,255,255,0.25)" }}>
            © {new Date().getFullYear()} Panini Italia Srl · Tutti i diritti riservati
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
        input:focus { border-color: ${BURGUNDY} !important; box-shadow: 0 0 0 2px rgba(107,15,26,0.15); }
        button:hover { filter: brightness(1.08); }
      `}</style>
    </div>
  );
}
