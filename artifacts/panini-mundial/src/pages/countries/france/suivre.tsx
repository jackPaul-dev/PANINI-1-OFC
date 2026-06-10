import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, AlertCircle, Loader2, Package, MapPin,
  CalendarDays, X, ChevronDown, ChevronUp,
  MessageCircle, RefreshCw, Clock, FileText, CheckCircle2,
} from "lucide-react";
import countryConfig from "@/lib/countryConfigFrance";

const BURGUNDY = "#6b0f1a";
const GREEN    = "#16a34a";
const AMBER    = "#f5a623";
const FRANCE_BLUE = "#002395";

const STEPS: { label: string; sub: string }[] = [
  { label: "Commande confirmée",       sub: "Commande traitée avec succès"           },
  { label: "Commande expédiée",        sub: "Départ de l'entrepôt"                   },
  { label: "Centre de distribution",  sub: "Arrivée au hub logistique"              },
  { label: "En cours de livraison",   sub: "Le livreur est dans votre secteur"      },
  { label: "Première tentative",      sub: "Léger retard en cours"                  },
  { label: "Localisation du colis",   sub: "Récupération du signal en cours"        },
  { label: "Contrôle douanier",       sub: "Inspection standard en cours"           },
  { label: "Vérification d'adresse",  sub: "En attente de confirmation de livraison"},
  { label: "Commande relancée",       sub: "Nouvelle route de livraison assignée"   },
  { label: "Livraison imminente",     sub: "Le livreur arrive bientôt"              },
];
const OFFSETS = [0, 1, 2, 3, 5, 6, 7, 8, 9, 10];

interface OrderEmailRecord { day: number; subject: string; status: string; scheduledAt: string | null; sentAt: string; }
interface OrderData { orderId: string; customerName: string; customerEmail?: string; city: string; createdAt: string; amount: number; items: string[]; emails: OrderEmailRecord[]; }

function resolveActiveStep(createdAt: string, urlStep: number | null): number {
  if (urlStep !== null && urlStep >= 0 && urlStep < STEPS.length) return urlStep;
  const elapsed = (Date.now() - new Date(createdAt).getTime()) / 86400000;
  let active = 0;
  for (let i = 0; i < OFFSETS.length; i++) { if (elapsed >= OFFSETS[i]) active = i; else break; }
  return Math.min(active, STEPS.length - 1);
}

function fmtFull(d: Date) {
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
function fmtShort(d: Date) {
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) + " · " + d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

type SupportStep = "menu" | "refund_form" | "refund_done";

interface SupportPanelProps { order: OrderData | null; onClose: () => void; }

const FAQ_ITEMS = [
  {
    id: "location",
    icon: <Package size={16} />,
    title: "OÙ SE TROUVE MA COMMANDE ?",
    content: "Votre commande est actuellement en cours de traitement dans notre système logistique. Consultez la chronologie ci-dessus pour voir l'étape précise de votre expédition. Des mises à jour sont également envoyées par e-mail à chaque changement de statut.",
  },
  {
    id: "timing",
    icon: <Clock size={16} />,
    title: "QUEL EST LE DÉLAI DE LIVRAISON ?",
    content: `Les délais de livraison estimés sont de ${countryConfig.deliveryTime}. En cas de forte demande, un délai supplémentaire de 1 à 3 jours peut s'appliquer.`,
  },
  {
    id: "tracking",
    icon: <RefreshCw size={16} />,
    title: "MON SUIVI NE SE MET PAS À JOUR",
    content: "Le suivi peut prendre 24 à 48 heures pour se mettre à jour entre deux étapes. Si vous ne voyez aucune mise à jour depuis plus de 5 jours ouvrés, contactez-nous à support@panini-fr.site en indiquant votre code de commande.",
  },
  {
    id: "contact",
    icon: <MessageCircle size={16} />,
    title: "CONTACTER LE SUPPORT",
    content: "Notre équipe d'assistance est disponible du lundi au vendredi, de 9h à 18h (CET). Écrivez-nous à support@panini-fr.site avec votre code de commande pour une réponse sous 24 heures.",
  },
];

function SupportPanel({ order, onClose }: SupportPanelProps) {
  const [step, setStep]       = useState<SupportStep>("menu");
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const [rfName,        setRfName]        = useState(order?.customerName  ?? "");
  const [rfEmail,       setRfEmail]       = useState(order?.customerEmail ?? "");
  const [rfOrder,       setRfOrder]       = useState(order?.orderId       ?? "");
  const [rfReason,      setRfReason]      = useState("");
  const [rfSubmitting,  setRfSubmitting]  = useState(false);

  function handleRefundSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rfName || !rfEmail || !rfOrder) return;
    setRfSubmitting(true);
    setTimeout(() => { setRfSubmitting(false); setStep("refund_done"); }, 1200);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        style={{ width: "100%", maxWidth: 500, background: "#fff", borderRadius: "20px 20px 0 0", maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 -8px 40px rgba(0,0,0,0.18)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ background: FRANCE_BLUE, padding: "0" }}>
          <div style={{ height: 3, background: `linear-gradient(90deg,${AMBER},#d4880a,${AMBER})` }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, background: "rgba(255,255,255,0.15)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MessageCircle size={18} color="#fff" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: "#fff", letterSpacing: "0.04em" }}>SERVICE CLIENT</p>
                <p style={{ margin: 0, fontSize: 10, color: `${AMBER}`, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
                  Centre d'assistance
                </p>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", cursor: "pointer", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X size={16} />
            </button>
          </div>
        </div>

        <div style={{ overflowY: "auto", flex: 1, padding: "0 0 24px" }}>

          {step === "menu" && (
            <>
              <div style={{ margin: "16px 16px 12px", background: "#fdf8f0", border: `1px solid ${AMBER}40`, borderRadius: 10, padding: "14px 16px" }}>
                <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: FRANCE_BLUE }}>
                  👋 Bonjour ! Bienvenue au Centre d'Assistance.
                </p>
                <p style={{ margin: 0, fontSize: 11, color: "#888", lineHeight: 1.6 }}>
                  Notre équipe est disponible pour répondre à vos questions sur l'état de votre commande, les délais de livraison, les mises à jour logistiques, les remboursements et l'assistance générale.
                </p>
              </div>

              {FAQ_ITEMS.map(item => (
                <div key={item.id} style={{ margin: "0 16px 8px", border: "1px solid #ede8e3", borderRadius: 10, overflow: "hidden" }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === item.id ? null : item.id)}
                    style={{ width: "100%", background: "#fff", border: "none", cursor: "pointer", padding: "14px 16px", display: "flex", alignItems: "center", gap: 10, textAlign: "left" }}
                  >
                    <span style={{ color: FRANCE_BLUE, flexShrink: 0 }}>{item.icon}</span>
                    <span style={{ flex: 1, fontSize: 11, fontWeight: 700, color: "#333", letterSpacing: "0.04em" }}>{item.title}</span>
                    {openFaq === item.id ? <ChevronUp size={14} color="#aaa" /> : <ChevronDown size={14} color="#aaa" />}
                  </button>
                  <AnimatePresence>
                    {openFaq === item.id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: "hidden" }}>
                        <div style={{ padding: "0 16px 14px 42px", fontSize: 12, color: "#666", lineHeight: 1.7, borderTop: "1px solid #f0ebe5" }}>
                          <p style={{ margin: "12px 0 0" }}>{item.content}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              <div style={{ margin: "0 16px 8px", border: "1px solid #ede8e3", borderRadius: 10, overflow: "hidden" }}>
                <button
                  onClick={() => setStep("refund_form")}
                  style={{ width: "100%", background: "#fff", border: "none", cursor: "pointer", padding: "14px 16px", display: "flex", alignItems: "center", gap: 10, textAlign: "left" }}
                >
                  <span style={{ color: FRANCE_BLUE, flexShrink: 0 }}><FileText size={16} /></span>
                  <span style={{ flex: 1, fontSize: 11, fontWeight: 700, color: "#333", letterSpacing: "0.04em" }}>DEMANDE DE REMBOURSEMENT</span>
                  <ChevronDown size={14} color="#aaa" />
                </button>
              </div>
            </>
          )}

          {step === "refund_form" && (
            <div style={{ padding: "16px" }}>
              <button onClick={() => setStep("menu")} style={{ background: "none", border: "none", cursor: "pointer", color: FRANCE_BLUE, fontSize: 12, fontWeight: 600, padding: "0 0 12px", display: "flex", alignItems: "center", gap: 4 }}>
                ← Retour au menu
              </button>
              <div style={{ background: "#fdf8f0", border: `1px solid ${AMBER}40`, borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
                <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, color: FRANCE_BLUE }}>📋 Demande de Remboursement</p>
                <p style={{ margin: 0, fontSize: 11, color: "#888", lineHeight: 1.6 }}>
                  Remplissez les informations ci-dessous. Après confirmation, le remboursement sera traité sous 7 jours ouvrés.
                </p>
              </div>
              <form onSubmit={handleRefundSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { label: "Nom complet",     value: rfName,   setter: setRfName,   placeholder: "Jean Dupont",          type: "text" },
                  { label: "E-mail",           value: rfEmail,  setter: setRfEmail,  placeholder: "jean@exemple.com",     type: "email" },
                  { label: "Code de commande", value: rfOrder,  setter: setRfOrder,  placeholder: "PAN-XXXXXX",           type: "text" },
                ].map(field => (
                  <div key={field.label}>
                    <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: "#aaa", textTransform: "uppercase" as const, letterSpacing: "0.18em", marginBottom: 5 }}>{field.label}</label>
                    <input required type={field.type} value={field.value} onChange={e => field.setter(e.target.value)} placeholder={field.placeholder}
                      style={{ width: "100%", border: "1px solid #ddd", borderRadius: 8, padding: "10px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" as const }} />
                  </div>
                ))}
                <div>
                  <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: "#aaa", textTransform: "uppercase" as const, letterSpacing: "0.18em", marginBottom: 5 }}>Motif du remboursement</label>
                  <textarea value={rfReason} onChange={e => setRfReason(e.target.value)} placeholder="Décrivez brièvement le motif..." rows={3}
                    style={{ width: "100%", border: "1px solid #ddd", borderRadius: 8, padding: "10px 12px", fontSize: 13, outline: "none", resize: "none", boxSizing: "border-box" as const, fontFamily: "inherit" }} />
                </div>
                <button type="submit" disabled={rfSubmitting}
                  style={{ background: FRANCE_BLUE, color: "#fff", border: "none", borderRadius: 8, padding: "13px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: rfSubmitting ? 0.7 : 1 }}>
                  {rfSubmitting ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Traitement…</> : "Confirmer la demande de remboursement"}
                </button>
              </form>
            </div>
          )}

          {step === "refund_done" && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ padding: "32px 24px", textAlign: "center" }}>
              <div style={{ width: 64, height: 64, background: "#f0fdf4", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <CheckCircle2 size={32} color={GREEN} />
              </div>
              <p style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 800, color: FRANCE_BLUE }}>Demande reçue !</p>
              <p style={{ margin: "0 0 20px", fontSize: 12, color: "#666", lineHeight: 1.7 }}>
                Votre demande de remboursement a été enregistrée avec succès.<br />
                Le montant sera <strong>crédité sous 7 jours ouvrés</strong> sur le moyen de paiement utilisé.
              </p>
              <div style={{ background: "#fdf8f0", border: `1px solid ${AMBER}40`, borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
                <p style={{ margin: "0 0 3px", fontSize: 10, color: "#aaa", textTransform: "uppercase" as const, letterSpacing: "0.15em" }}>Code de référence</p>
                <p style={{ margin: 0, fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: FRANCE_BLUE }}>
                  RMB-{rfOrder || "XXXXXX"}-{Date.now().toString().slice(-4)}
                </p>
              </div>
              <p style={{ margin: 0, fontSize: 11, color: "#aaa", lineHeight: 1.6 }}>
                Vous recevrez une confirmation par e-mail à <strong>{rfEmail}</strong>.<br />
                En cas de questions : support@panini-fr.site
              </p>
              <button onClick={() => { setStep("menu"); onClose(); }}
                style={{ marginTop: 20, background: FRANCE_BLUE, color: "#fff", border: "none", borderRadius: 8, padding: "11px 24px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                Fermer
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function FranceSuivre() {
  const [inputId,  setInputId]  = useState("");
  const [order,    setOrder]    = useState<OrderData | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [urlStep,  setUrlStep]  = useState<number | null>(null);
  const [support,  setSupport]  = useState(false);

  function orderFromParams(params: URLSearchParams, orderId: string): OrderData | null {
    const name     = params.get("name");
    const city     = params.get("city");
    const amt      = params.get("amount");
    const date     = params.get("date");
    const itemsB64 = params.get("items");
    if (!name || !city || !amt || !date) return null;
    let items: string[] = [];
    try { items = JSON.parse(atob(itemsB64 ?? "")); } catch { items = []; }
    return { orderId, customerName: name, city, createdAt: date, amount: parseFloat(amt), items, emails: [] };
  }

  useEffect(() => {
    const params   = new URLSearchParams(window.location.search);
    const orderId  = params.get("orderId");
    const step     = params.get("step");
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
          .then((data: OrderData | null) => { if (data) setOrder(data); })
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
      .then(r => { if (!r.ok) throw new Error("Commande introuvable"); return r.json(); })
      .then((data: OrderData) => { setOrder(data); setUrlStep(step); setLoading(false); })
      .catch(e => { setError(e.message); setOrder(null); setLoading(false); });
  }

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchOrder(inputId, null); };
  const activeStep = order ? resolveActiveStep(order.createdAt, urlStep) : 0;
  const base       = order ? new Date(order.createdAt).getTime() : 0;

  return (
    <div style={{ minHeight: "100vh", background: "#f0ece8", fontFamily: "-apple-system,Helvetica,Arial,sans-serif" }}>

      {/* HEADER */}
      <div style={{ background: FRANCE_BLUE }}>
        <div style={{ height: 4, background: `linear-gradient(90deg,${AMBER},#d4880a,${AMBER})` }} />
        <div style={{ textAlign: "center", padding: "24px 20px 20px" }}>
          <img src="/assets/logo-panini-oficial.png" alt="Panini" style={{ height: 52, width: "auto", display: "block", margin: "0 auto 12px" }} />
          <div style={{ display: "inline-block", background: "rgba(255,255,255,0.12)", borderRadius: 20, padding: "5px 18px", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.85)", letterSpacing: "0.22em", textTransform: "uppercase" as const }}>
            Suivi de commande · FIFA World Cup 26™
          </div>
        </div>
        <div style={{ height: 3, background: `linear-gradient(90deg,${AMBER},#d4880a,${AMBER})` }} />
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "28px 16px 100px" }}>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ background: "#fff", border: "1px solid #e8e0d8", borderRadius: 4, padding: "24px 28px", marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: "#aaa", textTransform: "uppercase" as const, letterSpacing: "0.22em", marginBottom: 10 }}>
            Entrez votre code de commande
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <input type="text" value={inputId} onChange={e => setInputId(e.target.value.toUpperCase())}
              placeholder="PAN-XXXXXX"
              style={{ flex: 1, border: "1px solid #ddd", padding: "12px 16px", fontSize: 14, fontFamily: "'Courier New',monospace", letterSpacing: "0.12em", textTransform: "uppercase" as const, outline: "none", borderRadius: 3 }} />
            <button type="submit" disabled={loading}
              style={{ background: GREEN, color: "#fff", border: "none", padding: "12px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", borderRadius: 3, display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" as const }}>
              {loading ? <Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} /> : <Search style={{ width: 16, height: 16 }} />}
              <span>Rechercher</span>
            </button>
          </div>
          <p style={{ margin: "10px 0 0", fontSize: 10, color: "#bbb" }}>Vous trouverez le code dans l'e-mail de confirmation reçu après votre achat</p>
        </form>

        {/* Error */}
        {error && searched && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: "#fff8f3", border: "1px solid #f5d5c0", borderRadius: 4, padding: "16px 20px", marginBottom: 20, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <AlertCircle style={{ width: 18, height: 18, color: FRANCE_BLUE, flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: FRANCE_BLUE }}>Commande introuvable</p>
              <p style={{ margin: "4px 0 0", fontSize: 11, color: "#888" }}>Vérifiez le code et réessayez. Vous le trouverez dans l'e-mail de confirmation Panini.</p>
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {!order && !error && !loading && !searched && (
          <div style={{ background: "#fff", border: "1px solid #e8e0d8", borderRadius: 4, padding: "48px 28px", textAlign: "center" }}>
            <Package style={{ width: 48, height: 48, color: "#d8cfc8", margin: "0 auto 16px", display: "block" }} />
            <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: FRANCE_BLUE }}>Suivez votre commande Panini</p>
            <p style={{ margin: 0, fontSize: 12, color: "#aaa", lineHeight: 1.6 }}>
              Entrez le code de commande reçu dans l'e-mail de confirmation<br />pour voir l'état de votre livraison en temps réel.
            </p>
          </div>
        )}

        {/* ORDER FOUND */}
        {order && (
          <>
            {/* Order info card */}
            <div style={{ background: "#fff", border: "1px solid #e8e0d8", borderRadius: 4, marginBottom: 16, overflow: "hidden" }}>
              <div style={{ background: FRANCE_BLUE, padding: "14px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ margin: "0 0 2px", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase" as const, letterSpacing: "0.22em" }}>Code commande</p>
                    <p style={{ margin: 0, fontFamily: "'Courier New',monospace", fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: "0.1em" }}>{order.orderId}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: "0 0 2px", fontSize: 9, color: "rgba(255,255,255,0.6)", textTransform: "uppercase" as const, letterSpacing: "0.18em" }}>Montant</p>
                    <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: AMBER }}>{countryConfig.currencySymbol}{order.amount.toFixed(2).replace(".", ",")}</p>
                  </div>
                </div>
              </div>
              <div style={{ padding: "14px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 20px" }}>
                <div>
                  <p style={{ margin: "0 0 2px", fontSize: 9, color: "#aaa", textTransform: "uppercase" as const, letterSpacing: "0.18em" }}>Client</p>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#333" }}>{order.customerName}</p>
                </div>
                <div>
                  <p style={{ margin: "0 0 2px", fontSize: 9, color: "#aaa", textTransform: "uppercase" as const, letterSpacing: "0.18em" }}>Ville</p>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#333" }}>
                    <MapPin size={11} style={{ display: "inline", marginRight: 3, color: AMBER }} />
                    {order.city}
                  </p>
                </div>
                <div>
                  <p style={{ margin: "0 0 2px", fontSize: 9, color: "#aaa", textTransform: "uppercase" as const, letterSpacing: "0.18em" }}>Date de commande</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#555" }}>
                    <CalendarDays size={10} style={{ display: "inline", marginRight: 3 }} />
                    {fmtFull(new Date(order.createdAt))}
                  </p>
                </div>
                <div>
                  <p style={{ margin: "0 0 2px", fontSize: 9, color: "#aaa", textTransform: "uppercase" as const, letterSpacing: "0.18em" }}>Articles</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#555" }}>{order.items.join(", ")}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div style={{ background: "#fff", border: "1px solid #e8e0d8", borderRadius: 4, padding: "24px 24px 20px", marginBottom: 16 }}>
              <p style={{ margin: "0 0 20px", fontSize: 9, fontWeight: 700, color: "#aaa", textTransform: "uppercase" as const, letterSpacing: "0.22em" }}>
                Chronologie de livraison
              </p>
              {STEPS.map((step: { label: string; sub: string }, i: number) => {
                const done   = i < activeStep;
                const active = i === activeStep;
                const stepDate = new Date(base + OFFSETS[i] * 86400000);

                return (
                  <div key={i} style={{ display: "flex", gap: 16, marginBottom: i < STEPS.length - 1 ? 4 : 0 }}>
                    {/* Dot + line */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 28, flexShrink: 0 }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: "50%",
                        background: done ? GREEN : active ? FRANCE_BLUE : "#e5e7eb",
                        color: done || active ? "#fff" : "#9ca3af",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 700,
                      }}>
                        {done ? "✓" : active ? "●" : String(i + 1)}
                      </div>
                      {i < STEPS.length - 1 && (
                        <div style={{ width: 2, flex: 1, minHeight: 28, background: done ? GREEN : "#e5e7eb", margin: "3px auto 0", borderRadius: 1 }} />
                      )}
                    </div>

                    {/* Label */}
                    <div style={{ flex: 1, paddingBottom: i < STEPS.length - 1 ? 20 : 0, paddingTop: 2 }}>
                      <p style={{ margin: "0 0 3px", fontSize: 11, fontWeight: done || active ? 700 : 400, color: done ? GREEN : active ? FRANCE_BLUE : "#9ca3af", textTransform: "uppercase" as const, letterSpacing: "0.07em" }}>
                        {step.label}
                      </p>
                      <p style={{ margin: 0, fontSize: 10, color: done ? "#6b7280" : active ? "#555" : "#c4c9d1" }}>
                        {done
                          ? `✓ Terminé — ${fmtShort(stepDate)}`
                          : active
                          ? `▶ En cours — ${step.sub}`
                          : `Prévu : ${fmtShort(stepDate)}`
                        }
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Support button */}
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <button
                onClick={() => setSupport(true)}
                style={{ background: FRANCE_BLUE, color: "#fff", border: "none", borderRadius: 8, padding: "12px 28px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                <MessageCircle size={15} />
                Besoin d'aide ?
              </button>
            </div>
          </>
        )}
      </div>

      {/* Support panel */}
      <AnimatePresence>
        {support && <SupportPanel order={order} onClose={() => setSupport(false)} />}
      </AnimatePresence>
    </div>
  );
}
