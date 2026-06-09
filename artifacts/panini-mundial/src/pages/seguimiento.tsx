import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Search, AlertCircle, Package, MapPin, CalendarDays, MessageCircle, ChevronDown, ChevronUp, X } from "lucide-react";

// ── Constants ─────────────────────────────────────────────────────────────────
const BURGUNDY = "#6b0f1a";
const AMBER    = "#d4a017";
const GREEN    = "#1a7a36";

const STEPS = [
  { label: "Order Confirmed",        sub: "Order successfully processed"         },
  { label: "Order Shipped",          sub: "Departed from warehouse"              },
  { label: "Distribution Center",   sub: "Arrived at regional logistics hub"    },
  { label: "Out for Delivery",       sub: "Courier is in your area"              },
  { label: "First Delivery Attempt", sub: "Minor delay in progress"             },
  { label: "Locating Package",       sub: "Signal being recovered"               },
  { label: "Customs Review",         sub: "Standard international inspection"    },
  { label: "Address Verification",  sub: "Awaiting delivery confirmation"       },
  { label: "Order Relaunched",       sub: "New delivery route assigned"          },
  { label: "Delivery Imminent",      sub: "Courier arriving shortly"             },
];

const OFFSETS = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5];

function resolveActiveStep(createdAt: string, overrideStep: number | null): number {
  if (overrideStep !== null && !isNaN(overrideStep)) {
    return Math.min(Math.max(0, overrideStep), STEPS.length - 1);
  }
  const hoursSince = (Date.now() - new Date(createdAt).getTime()) / 3_600_000;
  if (hoursSince < 1)   return 0;
  if (hoursSince < 12)  return 1;
  if (hoursSince < 24)  return 2;
  if (hoursSince < 36)  return 3;
  if (hoursSince < 48)  return 4;
  if (hoursSince < 60)  return 5;
  if (hoursSince < 72)  return 6;
  if (hoursSince < 84)  return 7;
  if (hoursSince < 96)  return 8;
  return 9;
}

function fmtShort(d: Date): string {
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}
function fmtFull(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

interface OrderData {
  orderId: string;
  customerName: string;
  city: string;
  createdAt: string;
  amount: number;
  items: string[];
  emails: { type: string; sentAt: string }[];
}

// ── FAQ ───────────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "How long does delivery take?",
    a: "Standard delivery takes 2–4 business days across the USA once your order is confirmed. Peak periods may add 1–2 extra days.",
  },
  {
    q: "My order is stuck — what should I do?",
    a: "Some delays are normal during high-demand periods. Our team monitors all orders daily. If you haven't received your package in 10 business days, please contact our support team.",
  },
  {
    q: "Can I change my delivery address?",
    a: "Once the order has been shipped, we can no longer change the address. Contact us as soon as possible if you notice an error.",
  },
  {
    q: "Is my order really on the way?",
    a: "Yes! All orders are logged in our system as soon as payment is confirmed. Your tracker will update automatically at each new stage.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid #f0ebe8" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", textAlign: "left" as const, padding: "14px 0",
          background: "none", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 700, color: BURGUNDY, lineHeight: 1.4 }}>{q}</span>
        {open ? <ChevronUp size={14} color={BURGUNDY} /> : <ChevronDown size={14} color={BURGUNDY} />}
      </button>
      {open && (
        <motion.p
          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
          style={{ fontSize: 11, color: "#666", lineHeight: 1.7, paddingBottom: 14, margin: 0 }}
        >
          {a}
        </motion.p>
      )}
    </div>
  );
}

// ── Support Panel ──────────────────────────────────────────────────────────────
function SupportPanel({ order, onClose }: { order: OrderData | null; onClose: () => void }) {
  const [step, setStep]     = useState<"menu" | "status" | "change" | "return" | "refund">("menu");
  const [rfEmail, setRfEmail]   = useState("");
  const [rfOrder, setRfOrder]   = useState(order?.orderId ?? "");
  const [rfReason, setRfReason] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const menuItems = [
    { key: "status" as const,  label: "📦  Where is my order?" },
    { key: "change" as const,  label: "✏️  I need to change something" },
    { key: "return" as const,  label: "↩️  I want to return" },
    { key: "refund" as const,  label: "💰  I want a refund" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 9998,
        background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "flex-end", justifyContent: "center",
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 34 }}
        style={{
          width: "100%", maxWidth: 460, background: "#fff",
          borderRadius: "20px 20px 0 0", padding: "24px 24px 40px",
          maxHeight: "88vh", overflowY: "auto" as const,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: BURGUNDY }}>
            {step === "menu" ? "How can we help?" : "Customer Support"}
          </p>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={18} color="#aaa" />
          </button>
        </div>

        {step === "menu" && (
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
            {menuItems.map(m => (
              <button
                key={m.key}
                onClick={() => { setStep(m.key); setSubmitted(false); }}
                style={{
                  background: "#fdf8f0", border: `1px solid ${AMBER}40`, borderRadius: 10,
                  padding: "14px 16px", textAlign: "left" as const, fontSize: 13, fontWeight: 600,
                  color: BURGUNDY, cursor: "pointer",
                }}
              >
                {m.label}
              </button>
            ))}
            <p style={{ margin: "12px 0 0", fontSize: 10, color: "#bbb", textAlign: "center" as const }}>
              Or email us: <span style={{ color: BURGUNDY }}>support@paniniworldcup2026.site</span>
            </p>
          </div>
        )}

        {step === "status" && !submitted && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <p style={{ fontSize: 12, color: "#555", marginBottom: 20, lineHeight: 1.6 }}>
              {order
                ? <>Your order <strong>{order.orderId}</strong> is currently in the <strong>{STEPS[resolveActiveStep(order.createdAt, null)]?.label}</strong> stage.</>
                : "Enter your order code to check the status."}
            </p>
            <button onClick={() => setStep("menu")} style={{ fontSize: 11, color: BURGUNDY, fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}>
              ← Back
            </button>
          </motion.div>
        )}

        {(step === "change" || step === "return" || step === "refund") && !submitted && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
              <div>
                <label style={{ fontSize: 10, color: "#aaa", textTransform: "uppercase" as const, letterSpacing: "0.15em", display: "block", marginBottom: 6 }}>Order Code</label>
                <input value={rfOrder} onChange={e => setRfOrder(e.target.value.toUpperCase())}
                  placeholder="PAN-XXXXXX"
                  style={{ width: "100%", border: "1px solid #ddd", borderRadius: 8, padding: "10px 14px", fontSize: 13, fontFamily: "monospace", boxSizing: "border-box" as const }} />
              </div>
              <div>
                <label style={{ fontSize: 10, color: "#aaa", textTransform: "uppercase" as const, letterSpacing: "0.15em", display: "block", marginBottom: 6 }}>Your email</label>
                <input type="email" value={rfEmail} onChange={e => setRfEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  style={{ width: "100%", border: "1px solid #ddd", borderRadius: 8, padding: "10px 14px", fontSize: 13, boxSizing: "border-box" as const }} />
              </div>
              <div>
                <label style={{ fontSize: 10, color: "#aaa", textTransform: "uppercase" as const, letterSpacing: "0.15em", display: "block", marginBottom: 6 }}>
                  {step === "change" ? "What do you need to change?" : step === "return" ? "Reason for return" : "Reason for refund"}
                </label>
                <textarea value={rfReason} onChange={e => setRfReason(e.target.value)} rows={3}
                  placeholder="Describe your situation..."
                  style={{ width: "100%", border: "1px solid #ddd", borderRadius: 8, padding: "10px 14px", fontSize: 13, resize: "none" as const, boxSizing: "border-box" as const }} />
              </div>
              <button
                onClick={() => setSubmitted(true)}
                style={{ background: BURGUNDY, color: "#fff", border: "none", borderRadius: 8, padding: "12px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
              >
                Send Request
              </button>
              <button onClick={() => setStep("menu")} style={{ fontSize: 11, color: "#aaa", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>
                ← Back
              </button>
            </div>
          </motion.div>
        )}

        {submitted && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: "center" as const, padding: "20px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <p style={{ fontSize: 15, fontWeight: 800, color: BURGUNDY, marginBottom: 8 }}>Request received!</p>
            <p style={{ fontSize: 12, color: "#666", lineHeight: 1.6, marginBottom: 16 }}>
              We will respond within <strong>24 business hours</strong> to the email provided.
            </p>
            <div style={{ background: "#fdf8f0", border: `1px solid ${AMBER}40`, borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
              <p style={{ margin: "0 0 3px", fontSize: 10, color: "#aaa", textTransform: "uppercase" as const, letterSpacing: "0.15em" }}>Reference code</p>
              <p style={{ margin: 0, fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: BURGUNDY }}>
                RMB-{rfOrder || "XXXXXX"}-{Date.now().toString().slice(-4)}
              </p>
            </div>
            <p style={{ margin: 0, fontSize: 11, color: "#aaa", lineHeight: 1.6 }}>
              A confirmation will be sent to <strong>{rfEmail}</strong>.<br />
              Questions? support@paniniworldcup2026.site
            </p>
            <button
              onClick={() => { setStep("menu"); onClose(); }}
              style={{ marginTop: 20, background: BURGUNDY, color: "#fff", border: "none", borderRadius: 8, padding: "11px 24px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
            >
              Close
            </button>
          </motion.div>
        )}
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

  function orderFromParams(params: URLSearchParams, orderId: string): OrderData | null {
    const name  = params.get("name");
    const city  = params.get("city");
    const amt   = params.get("amount");
    const date  = params.get("date");
    const itemsB64 = params.get("items");
    if (!name || !city || !amt || !date) return null;
    let items: string[] = [];
    try { items = JSON.parse(atob(itemsB64 ?? "")); } catch { items = []; }
    return { orderId, customerName: name, city, createdAt: date, amount: parseFloat(amt), items, emails: [] };
  }

  useEffect(() => {
    const params  = new URLSearchParams(window.location.search);
    const orderId = params.get("orderId");
    const step    = params.get("step");
    const parsedStep = step !== null ? parseInt(step, 10) : null;
    if (parsedStep !== null) setUrlStep(parsedStep);
    if (orderId) {
      setInputId(orderId.toUpperCase());
      const fromUrl = orderFromParams(params, orderId.toUpperCase());
      if (fromUrl) {
        setOrder(fromUrl);
        setUrlStep(parsedStep);
        setSearched(true);
        fetch(`/api/orders/${orderId.toUpperCase()}`)
          .then(r => r.ok ? r.json() : null)
          .then((data: OrderData | null) => { if (data) { setOrder(data); } })
          .catch(() => {});
      } else {
        fetchOrder(orderId, parsedStep);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function fetchOrder(id: string, step: number | null = urlStep) {
    const clean = id.trim().toUpperCase();
    if (!clean) return;
    setLoading(true); setError(null); setSearched(true);
    fetch(`/api/orders/${clean}`)
      .then(r => { if (!r.ok) throw new Error("Order not found"); return r.json(); })
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
            Order Tracking · FIFA World Cup 26™
          </div>
        </div>
        <div style={{ height: 3, background: `linear-gradient(90deg,${AMBER},#d4880a,${AMBER})` }} />
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "28px 16px 100px" }}>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ background: "#fff", border: "1px solid #e8e0d8", borderRadius: 4, padding: "24px 28px", marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: "#aaa", textTransform: "uppercase" as const, letterSpacing: "0.22em", marginBottom: 10 }}>
            Enter your order code
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
              <span>Search</span>
            </button>
          </div>
          <p style={{ margin: "10px 0 0", fontSize: 10, color: "#bbb" }}>Find your code in the confirmation email you received after purchase</p>
        </form>

        {/* Error */}
        {error && searched && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: "#fff8f3", border: "1px solid #f5d5c0", borderRadius: 4, padding: "16px 20px", marginBottom: 20, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <AlertCircle style={{ width: 18, height: 18, color: BURGUNDY, flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: BURGUNDY }}>Order not found</p>
              <p style={{ margin: "4px 0 0", fontSize: 11, color: "#888" }}>Check your code and try again. You can find it in your Panini confirmation email.</p>
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {!order && !error && !loading && !searched && (
          <div style={{ background: "#fff", border: "1px solid #e8e0d8", borderRadius: 4, padding: "48px 28px", textAlign: "center" }}>
            <Package style={{ width: 48, height: 48, color: "#d8cfc8", margin: "0 auto 16px", display: "block" }} />
            <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: BURGUNDY }}>Track your Panini order</p>
            <p style={{ margin: 0, fontSize: 12, color: "#aaa", lineHeight: 1.6 }}>Enter the order code from your confirmation email<br />to see your shipment status in real time.</p>
          </div>
        )}

        {/* ── ORDER FOUND ── */}
        {order && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>

            {/* Code hero */}
            <div style={{ background: "#fff8f3", border: `2px solid ${AMBER}`, borderRadius: 4, padding: "22px 28px", marginBottom: 16, textAlign: "center" }}>
              <p style={{ margin: "0 0 4px", fontSize: 9, color: "#aaa", textTransform: "uppercase" as const, letterSpacing: "0.22em" }}>Order Code</p>
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
                  <p style={{ margin: "0 0 2px", fontSize: 9, color: "#bbb", textTransform: "uppercase" as const, letterSpacing: "0.18em" }}>Recipient</p>
                  <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700, color: BURGUNDY }}>{order.customerName}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#888", display: "flex", alignItems: "center", gap: 4 }}>
                    <MapPin style={{ width: 10, height: 10 }} /> {order.city}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: "0 0 2px", fontSize: 9, color: "#bbb", textTransform: "uppercase" as const, letterSpacing: "0.18em" }}>Total</p>
                  <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: BURGUNDY }}>$ {order.amount.toFixed(2)}</p>
                </div>
              </div>
              {order.items.length > 0 && (
                <div>
                  <p style={{ margin: "0 0 12px", fontSize: 9, color: "#bbb", textTransform: "uppercase" as const, letterSpacing: "0.18em" }}>Order Items</p>
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
              <p style={{ margin: "0 0 22px", fontSize: 9, color: "#bbb", textTransform: "uppercase" as const, letterSpacing: "0.2em" }}>Your shipment status</p>
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
                      {done   && <p style={{ margin: 0, fontSize: 10, color: "#999" }}>Completed · {fmtFull(stepDate)}</p>}
                      {active && <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: BURGUNDY, display: "flex", alignItems: "center", gap: 4 }}><span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: BURGUNDY, animation: "pulse 1.5s infinite" }} />In progress — {step.sub}</p>}
                      {!done && !active && <p style={{ margin: 0, fontSize: 10, color: "#ccc" }}>Expected: {fmtFull(stepDate)}</p>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Status banner */}
            <div style={{ background: BURGUNDY, borderRadius: 4, padding: "16px 28px", textAlign: "center", marginBottom: 16 }}>
              <p style={{ margin: "0 0 4px", fontSize: 9, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" as const, letterSpacing: "0.2em" }}>Current Status</p>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#fff", letterSpacing: "0.05em" }}>
                {STEPS[activeStep]?.label.toUpperCase()} {order.city ? `· ${order.city.toUpperCase()}` : ""}
              </p>
            </div>

            {/* FAQ */}
            <div style={{ background: "#fff", border: "1px solid #e8e0d8", borderRadius: 4, padding: "20px 28px", marginBottom: 16 }}>
              <p style={{ margin: "0 0 12px", fontSize: 9, color: "#bbb", textTransform: "uppercase" as const, letterSpacing: "0.2em" }}>Frequently Asked Questions</p>
              {FAQS.map((faq, i) => <FaqItem key={i} {...faq} />)}
            </div>

            {/* Help note */}
            <div style={{ background: "#fff", border: "1px solid #e8e0d8", borderRadius: 4, padding: "14px 28px", textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 10, color: "#bbb", lineHeight: 1.7 }}>
                You'll receive email updates at every status change.<br />
                Need help? <span style={{ color: BURGUNDY, fontWeight: 600 }}>support@paniniworldcup2026.site</span>
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
          <p style={{ margin: "0 0 4px", fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em", textTransform: "uppercase" as const }}>Panini USA LLC · Official FIFA World Cup 2026 Licensee</p>
          <p style={{ margin: 0, fontSize: 9, color: "rgba(255,255,255,0.25)" }}>© {new Date().getFullYear()} Panini USA LLC · All rights reserved</p>
        </div>
      </div>

      {/* ── FLOATING SUPPORT BUTTON ── */}
      <motion.button
        onClick={() => setSupport(true)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        style={{
          position: "fixed", bottom: 28, right: 20, zIndex: 9997,
          background: `linear-gradient(135deg, ${BURGUNDY} 0%, #8b1320 100%)`,
          border: `2px solid ${AMBER}`,
          borderRadius: 36,
          height: 56,
          paddingLeft: 18, paddingRight: 22,
          display: "flex", alignItems: "center", gap: 10,
          cursor: "pointer",
          boxShadow: "0 6px 24px rgba(107,15,26,0.45), 0 2px 8px rgba(0,0,0,0.2)",
        }}
      >
        <div style={{ width: 34, height: 34, background: "rgba(255,255,255,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <MessageCircle size={18} color="#fff" fill="rgba(255,255,255,0.2)" />
        </div>
        <div style={{ textAlign: "left" }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: "#fff", letterSpacing: "0.03em", lineHeight: 1.2 }}>Support</p>
          <p style={{ margin: 0, fontSize: 9, color: AMBER, letterSpacing: "0.05em" }}>● Online now</p>
        </div>
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
