import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Send, Eye, RefreshCw, CheckCircle2, XCircle,
  Clock, ChevronDown, ChevronUp, Package, Loader2,
} from "lucide-react";

interface EmailRecord {
  day: number;
  subject: string;
  resendId: string | null;
  status: "sent" | "scheduled" | "failed";
  scheduledAt: string | null;
  sentAt: string;
}

interface Order {
  orderId: string;
  customerName: string;
  customerEmail: string;
  city: string;
  createdAt: string;
  amount: number;
  items: string[];
  emails: EmailRecord[];
}

const DAY_LABELS: Record<number, string> = {
  0: "Giorno 0 — Conferma", 1: "Giorno 1 — In viaggio",
  2: "Giorno 2 — Centro distribuzione", 3: "Giorno 3 — In consegna",
  5: "Giorno 5 — Ritardo", 6: "Giorno 6 — Localizzazione",
  7: "Giorno 7 — Controllo doganale", 8: "Giorno 8 — Verifica indirizzo",
  9: "Giorno 9 — Rilanciato", 10: "Giorno 10 — Imminente",
  11: "Giorno 11+", 12: "Giorno 12+", 13: "Giorno 13+", 14: "Giorno 14+",
  15: "Giorno 15+", 16: "Giorno 16+", 17: "Giorno 17+", 18: "Giorno 18+",
  19: "Giorno 19+", 20: "Giorno 20+",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("it-IT", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: string }) {
  if (status === "sent") return (
    <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-green-700 bg-green-50 border border-green-200 px-2 py-0.5">
      <CheckCircle2 className="w-2.5 h-2.5" /> Inviato
    </span>
  );
  if (status === "scheduled") return (
    <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5">
      <Clock className="w-2.5 h-2.5" /> Programmato
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-2 py-0.5">
      <XCircle className="w-2.5 h-2.5" /> Fallito
    </span>
  );
}

function OrderCard({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);
  const sentCount = order.emails.filter(e => e.status === "sent").length;
  const schCount  = order.emails.filter(e => e.status === "scheduled").length;
  const failCount = order.emails.filter(e => e.status === "failed").length;

  return (
    <div className="bg-white border border-gray-200 mb-3">
      <button
        className="w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <Package className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm font-bold text-gray-900">{order.orderId}</span>
            <span className="text-xs text-gray-500">{order.customerName}</span>
            <span className="text-xs text-gray-400">{order.city}</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{order.customerEmail}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-[9px] text-gray-400">{fmtDate(order.createdAt)}</span>
            <span className="text-[9px] font-bold text-gray-700">€ {order.amount.toFixed(2).replace(".", ",")}</span>
            {sentCount > 0  && <span className="text-[9px] text-green-600">✓ {sentCount} inviati</span>}
            {schCount > 0   && <span className="text-[9px] text-blue-600">⏱ {schCount} programmati</span>}
            {failCount > 0  && <span className="text-[9px] text-red-500">✗ {failCount} falliti</span>}
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 mt-1" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-100 px-5 py-4">
              {/* Items */}
              {order.items.length > 0 && (
                <div className="mb-4">
                  <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-2">Articoli</p>
                  <ul className="space-y-1">
                    {order.items.map((item, i) => (
                      <li key={i} className="text-xs text-gray-600 flex gap-2">
                        <span className="shrink-0 mt-1.5 w-1 h-1 rounded-full bg-gray-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Email records */}
              <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-3">Sequenza email ({order.emails.length} totali)</p>
              {order.emails.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Nessuna email inviata</p>
              ) : (
                <div className="space-y-2">
                  {order.emails.map((em, i) => (
                    <div key={i} className="flex items-start gap-3 text-xs py-2 border-b border-gray-50 last:border-0">
                      <StatusBadge status={em.status} />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-700 font-medium truncate">{em.subject}</p>
                        <p className="text-gray-400 text-[10px] mt-0.5">
                          {DAY_LABELS[em.day] ?? `Giorno ${em.day}`}
                          {em.scheduledAt && ` · Programmato per ${fmtDate(em.scheduledAt)}`}
                          {!em.scheduledAt && ` · Inviato ${fmtDate(em.sentAt)}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function EmailPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [testEmail, setTestEmail] = useState("");
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [tab, setTab] = useState<"orders" | "test">("orders");

  const loadOrders = () => {
    setLoadingOrders(true);
    fetch("/api/emails/orders")
      .then(r => r.json())
      .then(data => { setOrders(data); setLoadingOrders(false); })
      .catch(() => setLoadingOrders(false));
  };

  useEffect(() => { loadOrders(); }, []);

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail) return;
    setTestLoading(true);
    setTestResult(null);
    try {
      const r = await fetch("/api/emails/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail }),
      });
      const data = await r.json();
      if (data.ok) {
        setTestResult({ ok: true, msg: `${data.sent} email inviate con successo a ${testEmail}` });
      } else {
        setTestResult({ ok: false, msg: data.error ?? "Errore sconosciuto" });
      }
    } catch {
      setTestResult({ ok: false, msg: "Errore di connessione al server" });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#efefef] font-sans">
      {/* Header */}
      <div className="bg-black text-white text-center py-5 px-4">
        <p className="text-xs text-gray-400 tracking-widest uppercase mb-1">Panini Italia · Admin</p>
        <h1 className="text-2xl font-black tracking-widest uppercase">PAINEL EMAIL</h1>
        <p className="text-xs text-gray-500 tracking-wider uppercase mt-1">Gestione sequenze post-vendita</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex mb-6 border border-gray-300 bg-white">
          <button
            onClick={() => setTab("orders")}
            className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
              tab === "orders" ? "bg-black text-white" : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <Package className="w-3.5 h-3.5" /> Pedidos ({orders.length})
            </span>
          </button>
          <button
            onClick={() => setTab("test")}
            className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
              tab === "test" ? "bg-black text-white" : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <Send className="w-3.5 h-3.5" /> Teste de Email
            </span>
          </button>
        </div>

        {/* Orders Tab */}
        {tab === "orders" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-gray-500">
                {orders.length === 0 ? "Nenhum pedido ainda" : `${orders.length} pedido${orders.length !== 1 ? "s" : ""} com sequência de email`}
              </p>
              <button
                onClick={loadOrders}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-black transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Aggiorna
              </button>
            </div>

            {loadingOrders ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white border border-gray-200 p-10 text-center">
                <Mail className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                <p className="text-sm font-semibold text-gray-700 mb-1">Nessun ordine ancora</p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Le sequenze email appariranno qui non appena i clienti completano un acquisto.<br />
                  Puoi inviare un test usando la scheda "Teste de Email".
                </p>
              </div>
            ) : (
              <div>
                {orders.map(order => (
                  <OrderCard key={order.orderId} order={order} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Test Tab */}
        {tab === "test" && (
          <div>
            <div className="bg-white border border-gray-200 p-6 mb-4">
              <div className="flex items-start gap-3 mb-6">
                <Eye className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">Anteprima completa della sequenza</p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Invia tutti i 12 template email (giorni 0–12) immediatamente a un indirizzo di test,
                    per verificare il layout e i contenuti prima del lancio.
                  </p>
                </div>
              </div>

              <form onSubmit={handleTest}>
                <label className="block text-[10px] font-semibold text-gray-400 tracking-widest uppercase mb-2">
                  Indirizzo email di test
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={e => setTestEmail(e.target.value)}
                    placeholder="tuo@email.com"
                    required
                    className="flex-1 border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-black"
                  />
                  <button
                    type="submit"
                    disabled={testLoading}
                    className="bg-black text-white px-5 py-3 flex items-center gap-2 text-sm font-semibold hover:bg-gray-900 disabled:opacity-50 transition-colors whitespace-nowrap"
                  >
                    {testLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Invia test
                  </button>
                </div>
              </form>

              {testResult && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 p-4 flex items-start gap-3 border ${
                    testResult.ok
                      ? "bg-green-50 border-green-200 text-green-800"
                      : "bg-red-50 border-red-200 text-red-800"
                  }`}
                >
                  {testResult.ok
                    ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                    : <XCircle className="w-4 h-4 mt-0.5 shrink-0" />}
                  <p className="text-xs">{testResult.msg}</p>
                </motion.div>
              )}
            </div>

            {/* Email sequence info */}
            <div className="bg-white border border-gray-200 p-6">
              <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-4">Sequenza programmata (produzione)</p>
              <div className="space-y-2">
                {[
                  { day: "Giorno 0",  offset: "Immediato",  label: "Conferma dell'ordine" },
                  { day: "Giorno 1",  offset: "+24 ore",    label: "Ordine in viaggio" },
                  { day: "Giorno 2",  offset: "+48 ore",    label: "Centro di distribuzione" },
                  { day: "Giorno 3",  offset: "+72 ore",    label: "In consegna oggi" },
                  { day: "Giorno 5",  offset: "+5 giorni",  label: "Avviso ritardo" },
                  { day: "Giorno 6",  offset: "+6 giorni",  label: "Localizzazione in corso" },
                  { day: "Giorno 7",  offset: "+7 giorni",  label: "Controllo doganale" },
                  { day: "Giorno 8",  offset: "+8 giorni",  label: "Verifica indirizzo" },
                  { day: "Giorno 9",  offset: "+9 giorni",  label: "Ordine rilanciato" },
                  { day: "Giorno 10", offset: "+10 giorni", label: "Consegna imminente" },
                  { day: "Giorni 11–20", offset: "+11–20 giorni", label: "Non consegnato / Di nuovo in rotta (alternati)" },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-gray-400 w-24 shrink-0 font-mono text-[10px]">{row.day}</span>
                    <span className="text-blue-600 w-24 shrink-0 text-[10px]">{row.offset}</span>
                    <span className="text-gray-700">{row.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="text-center py-6">
        <p className="text-[9px] text-gray-400 tracking-widest uppercase">
          © {new Date().getFullYear()} Panini Italia Srl · Painel Interno
        </p>
      </div>
    </div>
  );
}
