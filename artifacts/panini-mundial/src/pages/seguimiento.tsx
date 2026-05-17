import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, AlertCircle, Loader2, Package, MapPin,
  CalendarDays, HelpCircle, X, ChevronDown, ChevronUp,
  MessageCircle, RefreshCw, Clock, FileText, CheckCircle2,
} from "lucide-react";

/* ── Brand ── */
const BURGUNDY = "#6b0f1a";
const GREEN    = "#16a34a";
const AMBER    = "#f5a623";

/* ── Types ── */
interface OrderEmailRecord { day: number; subject: string; status: string; scheduledAt: string | null; sentAt: string; }
interface OrderData { orderId: string; customerName: string; customerEmail?: string; city: string; createdAt: string; amount: number; items: string[]; emails: OrderEmailRecord[]; }

/* ── Timeline steps ── */
const STEPS = [
  { label: "Conferma dell'ordine",       sub: "Ordine elaborato con successo" },
  { label: "Ordine in viaggio",           sub: "Partito dal magazzino" },
  { label: "Centro di distribuzione",     sub: "Arrivato all'hub logistico" },
  { label: "In consegna nella tua città", sub: "Corriere in zona" },
  { label: "Primo tentativo di consegna", sub: "Piccolo ritardo in corso" },
  { label: "Localizzazione in corso",     sub: "Segnale in recupero" },
  { label: "Controllo doganale",          sub: "In revisione standard" },
  { label: "Verifica dell'indirizzo",     sub: "In attesa di conferma" },
  { label: "Ordine rilanciato",           sub: "Nuovo percorso assegnato" },
  { label: "Consegna imminente",          sub: "Corriere in arrivo" },
];
const OFFSETS = [0, 1, 2, 3, 5, 6, 7, 8, 9, 10];

function resolveActiveStep(createdAt: string, urlStep: number | null): number {
  if (urlStep !== null && urlStep >= 0 && urlStep < STEPS.length) return urlStep;
  const elapsed = (Date.now() - new Date(createdAt).getTime()) / 86400000;
  let active = 0;
  for (let i = 0; i < OFFSETS.length; i++) { if (elapsed >= OFFSETS[i]) active = i; else break; }
  return Math.min(active, STEPS.length - 1);
}

function fmtFull(d: Date) { return d.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" }); }
function fmtShort(d: Date) { return d.toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" }) + " · " + d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }); }

/* ════════════════════════════════════════════
   SUPPORT PANEL
════════════════════════════════════════════ */
type SupportStep = "menu" | "refund_form" | "refund_done";

interface SupportPanelProps {
  order: OrderData | null;
  onClose: () => void;
}

const FAQ_ITEMS = [
  {
    id: "location",
    icon: <Package size={16} />,
    title: "DOVE SI TROVA IL MIO ORDINE?",
    content: "Il tuo ordine è attualmente in lavorazione nel nostro sistema logistico. Consulta la linea del tempo qui sopra per vedere la fase precisa della tua spedizione. Gli aggiornamenti vengono inviati anche via email ad ogni cambio di stato.",
  },
  {
    id: "timing",
    icon: <Clock size={16} />,
    title: "QUAL È IL TEMPO DI CONSEGNA?",
    content: "I tempi di consegna stimati sono 7–14 giorni lavorativi dalla data dell'ordine, a seconda della destinazione. Le spedizioni internazionali possono richiedere ulteriori 3–5 giorni per lo sdoganamento.",
  },
  {
    id: "tracking",
    icon: <RefreshCw size={16} />,
    title: "IL MIO RASTREAMENTO NON SI AGGIORNA",
    content: "Il tracciamento può impiegare 24–48 ore ad aggiornarsi tra una fase e l'altra. Se non vedi aggiornamenti da più di 5 giorni lavorativi, contattaci a assistenza@panini-it.site indicando il tuo codice ordine.",
  },
  {
    id: "contact",
    icon: <MessageCircle size={16} />,
    title: "PARLARE CON IL SUPPORTO",
    content: "Il nostro team di assistenza è disponibile dal lunedì al venerdì, dalle 9:00 alle 18:00 (CET). Scrivici a assistenza@panini-it.site con il tuo codice ordine per una risposta entro 24 ore.",
  },
];

function SupportPanel({ order, onClose }: SupportPanelProps) {
  const [step, setStep]         = useState<SupportStep>("menu");
  const [openFaq, setOpenFaq]   = useState<string | null>(null);

  /* Refund form state */
  const [rfName,    setRfName]    = useState(order?.customerName  ?? "");
  const [rfEmail,   setRfEmail]   = useState(order?.customerEmail ?? "");
  const [rfOrder,   setRfOrder]   = useState(order?.orderId       ?? "");
  const [rfReason,  setRfReason]  = useState("");
  const [rfSubmitting, setRfSubmitting] = useState(false);

  function handleRefundSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rfName || !rfEmail || !rfOrder) return;
    setRfSubmitting(true);
    setTimeout(() => { setRfSubmitting(false); setStep("refund_done"); }, 1200);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 9998,
        background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        style={{
          width: "100%", maxWidth: 500,
          background: "#fff",
          borderRadius: "20px 20px 0 0",
          maxHeight: "90vh",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ background: BURGUNDY, padding: "0" }}>
          <div style={{ height: 3, background: `linear-gradient(90deg,${AMBER},#d4880a,${AMBER})` }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, background: "rgba(255,255,255,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MessageCircle size={18} color="#fff" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "#fff", letterSpacing: "0.04em" }}>SUPORTE AO CLIENTE</p>
                <p style={{ margin: 0, fontSize: 10, color: `${AMBER}`, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
                  Centro di Assistenza
                </p>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", cursor: "pointer", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: "auto", flex: 1, padding: "0 0 24px" }}>

          {/* ── MENU ── */}
          {step === "menu" && (
            <>
              {/* Welcome card */}
              <div style={{ margin: "16px 16px 12px", background: "#fdf8f0", border: `1px solid ${AMBER}40`, borderRadius: 10, padding: "14px 16px" }}>
                <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: BURGUNDY }}>
                  👋 Olá! Bem-vindo ao Centro de Apoio.
                </p>
                <p style={{ margin: 0, fontSize: 11, color: "#888", lineHeight: 1.6 }}>
                  A nossa equipa está disponível para ajudar com dúvidas relacionadas ao estado da encomenda, prazos de entrega, atualizações logísticas, reembolsos e suporte geral.
                </p>
              </div>

              {/* FAQ items */}
              {FAQ_ITEMS.map(item => (
                <div key={item.id} style={{ margin: "0 16px 8px", border: "1px solid #ede8e3", borderRadius: 10, overflow: "hidden" }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === item.id ? null : item.id)}
                    style={{
                      width: "100%", background: "#fff", border: "none", cursor: "pointer",
                      padding: "14px 16px", display: "flex", alignItems: "center", gap: 10,
                      textAlign: "left",
                    }}
                  >
                    <span style={{ color: BURGUNDY, flexShrink: 0 }}>{item.icon}</span>
                    <span style={{ flex: 1, fontSize: 11, fontWeight: 700, color: "#333", letterSpacing: "0.04em" }}>{item.title}</span>
                    {openFaq === item.id ? <ChevronUp size={14} color="#aaa" /> : <ChevronDown size={14} color="#aaa" />}
                  </button>
                  <AnimatePresence>
                    {openFaq === item.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ overflow: "hidden" }}
                      >
                        <div style={{ padding: "0 16px 14px 42px", fontSize: 12, color: "#666", lineHeight: 1.7, borderTop: "1px solid #f0ebe5" }}>
                          <p style={{ margin: "12px 0 0" }}>{item.content}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {/* Refund button */}
              <div style={{ margin: "0 16px 8px", border: "1px solid #ede8e3", borderRadius: 10, overflow: "hidden" }}>
                <button
                  onClick={() => setStep("refund_form")}
                  style={{
                    width: "100%", background: "#fff", border: "none", cursor: "pointer",
                    padding: "14px 16px", display: "flex", alignItems: "center", gap: 10,
                    textAlign: "left",
                  }}
                >
                  <span style={{ color: BURGUNDY, flexShrink: 0 }}><FileText size={16} /></span>
                  <span style={{ flex: 1, fontSize: 11, fontWeight: 700, color: "#333", letterSpacing: "0.04em" }}>PEDIDO DE REEMBOLSO</span>
                  <ChevronDown size={14} color="#aaa" />
                </button>
              </div>
            </>
          )}

          {/* ── REFUND FORM ── */}
          {step === "refund_form" && (
            <div style={{ padding: "16px" }}>
              <button
                onClick={() => setStep("menu")}
                style={{ background: "none", border: "none", cursor: "pointer", color: BURGUNDY, fontSize: 12, fontWeight: 600, padding: "0 0 12px", display: "flex", alignItems: "center", gap: 4 }}
              >
                ← Torna al menu
              </button>

              <div style={{ background: "#fdf8f0", border: `1px solid ${AMBER}40`, borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
                <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, color: BURGUNDY }}>📋 Pedido de Reembolso</p>
                <p style={{ margin: 0, fontSize: 11, color: "#888", lineHeight: 1.6 }}>
                  Preencha os dados abaixo. Após a confirmação, o reembolso será processado em até 7 dias úteis.
                </p>
              </div>

              <form onSubmit={handleRefundSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { label: "Nome completo", value: rfName,   setter: setRfName,   placeholder: "Mario Rossi",           type: "text" },
                  { label: "Email",          value: rfEmail, setter: setRfEmail,  placeholder: "mario@exemplo.com",      type: "email" },
                  { label: "Código do pedido", value: rfOrder, setter: setRfOrder, placeholder: "PAN-XXXXXX",           type: "text" },
                ].map(field => (
                  <div key={field.label}>
                    <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: "#aaa", textTransform: "uppercase" as const, letterSpacing: "0.18em", marginBottom: 5 }}>
                      {field.label}
                    </label>
                    <input
                      required
                      type={field.type}
                      value={field.value}
                      onChange={e => field.setter(e.target.value)}
                      placeholder={field.placeholder}
                      style={{ width: "100%", border: "1px solid #ddd", borderRadius: 8, padding: "10px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" as const }}
                    />
                  </div>
                ))}

                <div>
                  <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: "#aaa", textTransform: "uppercase" as const, letterSpacing: "0.18em", marginBottom: 5 }}>
                    Motivo do reembolso
                  </label>
                  <textarea
                    value={rfReason}
                    onChange={e => setRfReason(e.target.value)}
                    placeholder="Descreva brevemente o motivo..."
                    rows={3}
                    style={{ width: "100%", border: "1px solid #ddd", borderRadius: 8, padding: "10px 12px", fontSize: 13, outline: "none", resize: "none", boxSizing: "border-box" as const, fontFamily: "inherit" }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={rfSubmitting}
                  style={{
                    background: BURGUNDY, color: "#fff", border: "none", borderRadius: 8,
                    padding: "13px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    opacity: rfSubmitting ? 0.7 : 1,
                  }}
                >
                  {rfSubmitting
                    ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Processando...</>
                    : "Confirmar Pedido de Reembolso"
                  }
                </button>
              </form>
            </div>
          )}

          {/* ── REFUND DONE ── */}
          {step === "refund_done" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ padding: "32px 24px", textAlign: "center" }}
            >
              <div style={{ width: 64, height: 64, background: "#f0fdf4", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <CheckCircle2 size={32} color={GREEN} />
              </div>
              <p style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 800, color: BURGUNDY }}>Pedido Recebido!</p>
              <p style={{ margin: "0 0 20px", fontSize: 12, color: "#666", lineHeight: 1.7 }}>
                O seu pedido de reembolso foi registado com sucesso.<br />
                O valor será <strong>creditado em até 7 dias úteis</strong> no método de pagamento original.
              </p>
              <div style={{ background: "#fdf8f0", border: `1px solid ${AMBER}40`, borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
                <p style={{ margin: "0 0 3px", fontSize: 10, color: "#aaa", textTransform: "uppercase" as const, letterSpacing: "0.15em" }}>Código de referência</p>
                <p style={{ margin: 0, fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: BURGUNDY }}>
                  RMB-{rfOrder || "XXXXXX"}-{Date.now().toString().slice(-4)}
                </p>
              </div>
              <p style={{ margin: 0, fontSize: 11, color: "#aaa", lineHeight: 1.6 }}>
                Receberá uma confirmação por email em <strong>{rfEmail}</strong>.<br />
                Em caso de dúvidas: assistenza@panini-it.site
              </p>
              <button
                onClick={() => { setStep("menu"); onClose(); }}
                style={{ marginTop: 20, background: BURGUNDY, color: "#fff", border: "none", borderRadius: 8, padding: "11px 24px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
              >
                Fechar
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════ */
export default function Seguimiento() {
  const [inputId,   setInputId]   = useState("");
  const [order,     setOrder]     = useState<OrderData | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [searched,  setSearched]  = useState(false);
  const [urlStep,   setUrlStep]   = useState<number | null>(null);
  const [support,   setSupport]   = useState(false);

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
    setLoading(true); setError(null); setSearched(true);
    fetch(`/api/orders/${clean}`)
      .then(r => { if (!r.ok) throw new Error("Ordine non trovato"); return r.json(); })
      .then((data: OrderData) => { setOrder(data); setUrlStep(step); setLoading(false); })
      .catch(e => { setError(e.message); setOrder(null); setLoading(false); });
  }

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchOrder(inputId, null); };
  const activeStep = order ? resolveActiveStep(order.createdAt, urlStep) : 0;
  const base       = order ? new Date(order.createdAt).getTime() : 0;

  return (
    <div style={{ minHeight: "100vh", background: "#f0ece8", fontFamily: "-apple-system,Helvetica,Arial,sans-serif" }}>

      {/* ── HEADER ── */}
      <div style={{ background: BURGUNDY }}>
        <div style={{ height: 4, background: `linear-gradient(90deg,${AMBER},#d4880a,${AMBER})` }} />
        <div style={{ textAlign: "center", padding: "24px 20px 20px" }}>
          <img src="/assets/logo-panini-oficial.png" alt="Panini" style={{ height: 52, width: "auto", display: "block", margin: "0 auto 12px" }} />
          <div style={{ display: "inline-block", background: "rgba(255,255,255,0.12)", borderRadius: 20, padding: "5px 18px", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.85)", letterSpacing: "0.22em", textTransform: "uppercase" as const }}>
            Tracciamento Ordine · FIFA World Cup 26™
          </div>
        </div>
        <div style={{ height: 3, background: `linear-gradient(90deg,${AMBER},#d4880a,${AMBER})` }} />
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "28px 16px 100px" }}>

        {/* Search */}
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
              style={{ flex: 1, border: "1px solid #ddd", padding: "12px 16px", fontSize: 14, fontFamily: "'Courier New',monospace", letterSpacing: "0.12em", textTransform: "uppercase" as const, outline: "none", borderRadius: 3 }}
            />
            <button type="submit" disabled={loading} style={{ background: GREEN, color: "#fff", border: "none", padding: "12px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", borderRadius: 3, display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" as const }}>
              {loading ? <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} /> : <Search style={{ width: 16, height: 16 }} />}
              <span>Cerca</span>
            </button>
          </div>
          <p style={{ margin: "10px 0 0", fontSize: 10, color: "#bbb" }}>Trovi il codice nell'email di conferma ricevuta dopo l'acquisto</p>
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
            <p style={{ margin: 0, fontSize: 12, color: "#aaa", lineHeight: 1.6 }}>Inserisci il codice ordine ricevuto nell'email di conferma<br />per vedere lo stato della tua spedizione in tempo reale.</p>
          </div>
        )}

        {/* ── ORDER FOUND ── */}
        {order && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>

            {/* Code hero */}
            <div style={{ background: "#fff8f3", border: `2px solid ${AMBER}`, borderRadius: 4, padding: "22px 28px", marginBottom: 16, textAlign: "center" }}>
              <p style={{ margin: "0 0 4px", fontSize: 9, color: "#aaa", textTransform: "uppercase" as const, letterSpacing: "0.22em" }}>Codice ordine</p>
              <p style={{ margin: "0 0 6px", fontFamily: "'Courier New',monospace", fontSize: 30, fontWeight: 700, color: BURGUNDY, letterSpacing: "0.16em" }}>{order.orderId}</p>
              <p style={{ margin: 0, fontSize: 10, color: "#bbb", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                <CalendarDays style={{ width: 11, height: 11 }} /> {fmtShort(new Date(order.createdAt))}
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
              <p style={{ margin: "0 0 22px", fontSize: 9, color: "#bbb", textTransform: "uppercase" as const, letterSpacing: "0.2em" }}>Stato della tua spedizione</p>
              {STEPS.map((step, i) => {
                const done    = i < activeStep;
                const active  = i === activeStep;
                const isLast  = i === STEPS.length - 1;
                const stepDate = new Date(base + OFFSETS[i] * 86400000);
                return (
                  <div key={i} style={{ display: "flex", gap: 16 }}>
                    <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", width: 28 }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: done ? GREEN : active ? "#fff" : "#e8e8e8", border: active ? `2px solid ${BURGUNDY}` : "none", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, zIndex: 1, fontSize: done ? 11 : 10, fontWeight: 700, color: done ? "#fff" : active ? BURGUNDY : "#bbb", boxShadow: active ? `0 0 0 3px rgba(107,15,26,0.12)` : "none" }}>
                        {done ? "✓" : String(i + 1)}
                      </div>
                      {!isLast && <div style={{ width: 2, flex: 1, minHeight: 28, marginTop: 2, background: done ? GREEN : "#e8e8e8", borderRadius: 1 }} />}
                    </div>
                    <div style={{ paddingBottom: isLast ? 0 : 24, flex: 1 }}>
                      <p style={{ margin: "0 0 3px", fontSize: 11, fontWeight: done || active ? 700 : 400, color: done ? GREEN : active ? BURGUNDY : "#ccc", textTransform: "uppercase" as const, letterSpacing: "0.07em", lineHeight: 1.3 }}>
                        {step.label}
                      </p>
                      {done   && <p style={{ margin: 0, fontSize: 10, color: "#999" }}>Completato · {fmtFull(stepDate)}</p>}
                      {active && <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: BURGUNDY, display: "flex", alignItems: "center", gap: 4 }}><span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: BURGUNDY, animation: "pulse 1.5s infinite" }} />In corso — {step.sub}</p>}
                      {!done && !active && <p style={{ margin: 0, fontSize: 10, color: "#ccc" }}>Previsto: {fmtFull(stepDate)}</p>}
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
      <div style={{ background: BURGUNDY }}>
        <div style={{ height: 3, background: `linear-gradient(90deg,${AMBER},#d4880a,${AMBER})` }} />
        <div style={{ textAlign: "center", padding: "20px 20px 24px" }}>
          <img src="/assets/logo-panini-oficial.png" alt="Panini" style={{ height: 32, width: "auto", display: "block", margin: "0 auto 10px", opacity: 0.6 }} />
          <p style={{ margin: "0 0 4px", fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em", textTransform: "uppercase" as const }}>Panini Italia Srl · Licenziatario Ufficiale FIFA</p>
          <p style={{ margin: 0, fontSize: 9, color: "rgba(255,255,255,0.25)" }}>© {new Date().getFullYear()} Panini Italia Srl · Tutti i diritti riservati</p>
        </div>
      </div>

      {/* ── FLOATING SUPPORT BUTTON ── */}
      <motion.button
        onClick={() => setSupport(true)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: "fixed", bottom: 24, right: 20, zIndex: 9997,
          background: BURGUNDY,
          border: `2px solid ${AMBER}`,
          borderRadius: "50%",
          width: 58, height: 58,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(107,15,26,0.35)",
        }}
      >
        <HelpCircle size={26} color="#fff" />
      </motion.button>

      {/* ── SUPPORT PANEL ── */}
      <AnimatePresence>
        {support && <SupportPanel order={order} onClose={() => setSupport(false)} />}
      </AnimatePresence>

      <style>{`
        @keyframes spin  { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
        input:focus, textarea:focus { border-color: ${BURGUNDY} !important; box-shadow: 0 0 0 2px rgba(107,15,26,0.15); }
        button:hover { filter: brightness(1.06); }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
