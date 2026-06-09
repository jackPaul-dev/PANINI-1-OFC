import { countryConfig } from "./countryConfig";

export interface EmailData {
  customerName: string;
  customerEmail: string;
  orderId: string;
  trackingUrl: string;
  amount: string;
  items: string[];
  city: string;
  createdAt: string;
}

const ASSET_BASE = (process.env.TRACKING_BASE_URL || "https://paniniworldcup2026.site").replace(/\/$/, "");
const LOGO_URL   = `${ASSET_BASE}/assets/logo-panini-oficial.png`;

/* ── Official Panini brand palette ── */
const C = {
  yellow  : "#f5c800",
  red     : "#c8102e",
  burgundy: "#6b0f1a",
  green   : "#16a34a",
  greenD  : "#15803d",
  amber   : "#f5a623",
  white   : "#ffffff",
  offWhite: "#fafaf8",
  warm50  : "#fdf8f4",
  warm100 : "#f5ede6",
  gray100 : "#f4f4f4",
  gray200 : "#e8e8e8",
  gray400 : "#9ca3af",
  gray500 : "#6b7280",
  gray700 : "#374151",
  gray900 : "#111827",
} as const;

const STEPS = countryConfig.trackingSteps;
const OFFSETS = [0, 1, 2, 3, 5, 6, 7, 8, 9, 10];

function fmtDate(d: Date) {
  return d.toLocaleDateString(countryConfig.locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

/* ── Frise chronologique en HTML email-safe ── */
function buildEmailTimeline(activeStepIndex: number, createdAt: string): string {
  const base = new Date(createdAt).getTime();
  const visibleCount = Math.max(5, activeStepIndex + 1);
  let rows = "";

  STEPS.slice(0, visibleCount).forEach((step, i) => {
    const done   = i < activeStepIndex;
    const active = i === activeStepIndex;
    const stepDate = new Date(base + OFFSETS[i] * 86400000);
    const isLast = i === visibleCount - 1;

    const dotBg    = done ? C.green : active ? C.burgundy : "#d1d5db";
    const dotColor = done || active ? "#fff" : "#9ca3af";
    const dotText  = done ? "&#10003;" : active ? "&#9679;" : String(i + 1);
    const lineBg   = done ? C.green : "#e5e7eb";
    const labelColor = done ? C.green : active ? C.burgundy : "#9ca3af";
    const labelW     = done || active ? "700" : "400";
    const subColor   = done ? "#6b7280" : active ? C.burgundy : "#c4c9d1";

    const statusLine = done
      ? `<span style="color:${C.green};font-size:10px;">&#10003; Terminé &mdash; ${fmtDate(stepDate)}</span>`
      : active
      ? `<span style="color:${C.burgundy};font-size:10px;font-weight:600;">&#9654; En cours &mdash; ${step.sub}</span>`
      : `<span style="color:#c4c9d1;font-size:10px;">Prévu : ${fmtDate(stepDate)}</span>`;

    rows += `
    <tr>
      <td width="32" valign="top" style="padding-bottom:${isLast ? "0" : "4px"};">
        <table role="presentation" cellspacing="0" cellpadding="0" style="width:32px;">
          <tr>
            <td align="center">
              <div style="width:26px;height:26px;border-radius:50%;background:${dotBg};color:${dotColor};font-family:Arial,sans-serif;font-size:11px;font-weight:700;text-align:center;line-height:26px;">${dotText}</div>
            </td>
          </tr>
          ${!isLast ? `<tr><td align="center"><div style="width:2px;height:30px;background:${lineBg};margin:3px auto 0;border-radius:1px;"></div></td></tr>` : ""}
        </table>
      </td>
      <td style="padding:2px 0 ${isLast ? "0" : "26px"} 12px;vertical-align:top;">
        <p style="margin:0 0 3px;font-family:-apple-system,Arial,Helvetica,sans-serif;font-size:11px;font-weight:${labelW};color:${labelColor};text-transform:uppercase;letter-spacing:0.07em;line-height:1.3;">${step.label}</p>
        <p style="margin:0;font-family:-apple-system,Arial,Helvetica,sans-serif;font-size:10px;color:${subColor};line-height:1.5;">${statusLine}</p>
      </td>
    </tr>`;
  });

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0">${rows}</table>`;
}

/* ── Liste de produits ── */
function buildProductRows(items: string[]): string {
  return items.map(item => `
    <tr>
      <td style="padding:9px 0;border-bottom:1px solid #f3ede8;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td width="14" valign="middle">
              <div style="width:7px;height:7px;border-radius:50%;background:${C.amber};margin-top:1px;"></div>
            </td>
            <td style="font-family:-apple-system,Arial,Helvetica,sans-serif;font-size:12px;color:${C.gray700};line-height:1.5;">${item}</td>
          </tr>
        </table>
      </td>
    </tr>`).join("");
}

/* ══════════════════════════════════════════════════════════
   SHELL — enveloppe complète de l'e-mail
   ══════════════════════════════════════════════════════════ */
function shell(opts: {
  badgeLabel: string;
  headline: string;
  preheader: string;
  trackingUrl: string;
  orderId: string;
  ctaLabel: string;
  customerName: string;
  customerEmail: string;
  amount: string;
  items: string[];
  createdAt: string;
  activeStep: number;
  bodyExtra?: string;
}): string {
  const year = new Date().getFullYear();
  const firstName = opts.customerName.split(" ")[0];
  const orderDate = fmtDate(new Date(opts.createdAt));
  const safeUrl = opts.trackingUrl.replace(/&/g, "&amp;");
  const F = "font-family:Arial,Helvetica,sans-serif;";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${opts.preheader}</title>
</head>
<body style="margin:0;padding:0;background:#f0ece8;">
<div style="display:none;max-height:0;overflow:hidden;">${opts.preheader}</div>

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#f0ece8">
<tr><td align="center" style="padding:20px 12px 40px;">
<table role="presentation" width="580" cellspacing="0" cellpadding="0"
       style="max-width:580px;width:100%;border-radius:4px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.09);">

  <!-- EN-TÊTE -->
  <tr>
    <td style="background:#ffffff;padding:0;">
      <div style="height:4px;background:linear-gradient(90deg,${C.amber},${C.yellow},${C.amber});"></div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center" style="padding:20px 32px 14px;">
            <img src="${LOGO_URL}" alt="Panini" width="140" style="display:block;max-width:140px;height:auto;border:0;" />
          </td>
        </tr>
        <tr>
          <td style="background:${C.burgundy};padding:7px 0;text-align:center;">
            <span style="${F}font-size:9px;font-weight:700;color:rgba(255,255,255,0.9);letter-spacing:0.28em;text-transform:uppercase;">${opts.badgeLabel}</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- CODE COMMANDE -->
  <tr>
    <td style="background:${C.warm50};padding:16px 32px;text-align:center;border-bottom:3px solid ${C.amber};">
      <p style="margin:0 0 2px;${F}font-size:9px;color:${C.gray400};text-transform:uppercase;letter-spacing:0.22em;">Code commande</p>
      <p style="margin:0;font-family:'Courier New',monospace;font-size:28px;font-weight:700;color:${C.burgundy};letter-spacing:0.14em;">${opts.orderId}</p>
      <p style="margin:6px 0 0;${F}font-size:10px;color:${C.gray400};">${orderDate} &middot; ${opts.customerEmail}</p>
    </td>
  </tr>

  <!-- SALUTATION -->
  <tr>
    <td style="background:#ffffff;padding:22px 32px 18px;border-bottom:1px solid #f0ebe6;">
      <h2 style="margin:0 0 10px;font-family:Georgia,serif;font-size:22px;font-weight:400;color:${C.burgundy};line-height:1.3;">${opts.headline}</h2>
      <p style="margin:0;${F}font-size:13px;color:#4b5563;line-height:1.7;">
        Bonjour <strong style="color:${C.burgundy};">${firstName}</strong>, votre commande est confirmée et en cours de traitement.
      </p>
      ${opts.bodyExtra ? `<div style="margin-top:14px;">${opts.bodyExtra}</div>` : ""}
    </td>
  </tr>

  <!-- PRODUITS -->
  ${opts.items.length > 0 ? `<tr>
    <td style="background:#ffffff;padding:16px 32px 18px;border-bottom:1px solid #f0ebe6;">
      <p style="margin:0 0 10px;${F}font-size:9px;font-weight:700;color:${C.gray400};text-transform:uppercase;letter-spacing:0.2em;">Articles commandés</p>
      ${opts.items.map(item => `<p style="margin:0 0 6px;${F}font-size:12px;color:#374151;line-height:1.5;padding-left:12px;border-left:3px solid ${C.amber};">${item}</p>`).join("")}
      <p style="margin:12px 0 0;padding-top:10px;border-top:1px solid #f0ebe6;${F}font-size:11px;color:${C.gray400};">Total payé (TVA incl.) &nbsp;<strong style="font-size:20px;color:${C.burgundy};">${countryConfig.currencySymbol}&nbsp;${opts.amount}</strong></p>
    </td>
  </tr>` : ""}

  <!-- FRISE DE SUIVI -->
  <tr>
    <td style="background:${C.offWhite};padding:20px 32px 22px;border-bottom:1px solid #e8e2dc;">
      <p style="margin:0 0 16px;${F}font-size:9px;font-weight:700;color:${C.gray400};text-transform:uppercase;letter-spacing:0.2em;">Statut d'expédition</p>
      ${buildEmailTimeline(opts.activeStep, opts.createdAt)}
    </td>
  </tr>

  <!-- CTA -->
  <tr>
    <td style="background:#ffffff;padding:24px 32px 28px;text-align:center;border-bottom:1px solid #f0ebe6;">
      <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto;">
        <tr>
          <td style="background:${C.green};border-radius:4px;">
            <a href="${safeUrl}" target="_blank"
               style="display:inline-block;background:${C.green};color:#ffffff;text-decoration:none;${F}font-size:15px;font-weight:700;padding:16px 48px;border-radius:4px;letter-spacing:0.03em;border:0;">
              ${opts.ctaLabel} &#8594;
            </a>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- PIED DE PAGE -->
  <tr>
    <td style="background:#fdf8f2;padding:16px 32px 20px;text-align:center;">
      <div style="height:2px;background:linear-gradient(90deg,${C.amber},${C.yellow},${C.amber});margin-bottom:14px;"></div>
      <p style="margin:0 0 4px;${F}font-size:9px;color:#b0a898;letter-spacing:0.18em;text-transform:uppercase;">${countryConfig.emailSupportLabel}</p>
      <p style="margin:0 0 4px;${F}font-size:10px;color:#c0b8af;">${countryConfig.emailShippingLine}</p>
      <p style="margin:0;${F}font-size:9px;color:#d0c8c0;">&copy; ${year} ${countryConfig.companyName} &middot; ${countryConfig.emailCopyrightLine}</p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

/* ══════════════════════════════════════════════════════════
   E-mails individuels — 12 variantes
   ══════════════════════════════════════════════════════════ */

export function emailDay0(data: EmailData): { subject: string; html: string } {
  return {
    subject: `✓ Commande ${data.orderId} confirmée — Panini France`,
    html: shell({
      badgeLabel   : "Confirmation de commande",
      headline     : `Votre commande est confirmée`,
      preheader    : `Commande ${data.orderId} confirmée. Merci pour votre achat sur Panini France.`,
      trackingUrl  : data.trackingUrl,
      orderId      : data.orderId,
      ctaLabel     : "Suivre ma commande en temps réel",
      customerName : data.customerName,
      customerEmail: data.customerEmail,
      amount       : data.amount,
      items        : data.items,
      createdAt    : data.createdAt,
      activeStep   : 0,
    }),
  };
}

export function emailDay1(data: EmailData): { subject: string; html: string } {
  return {
    subject: `📦 Votre commande ${data.orderId} est en route — Panini France`,
    html: shell({
      badgeLabel   : "Commande expédiée",
      headline     : `Votre commande est en transit`,
      preheader    : `Votre commande ${data.orderId} a quitté l'entrepôt et est en route vers ${data.city}.`,
      trackingUrl  : data.trackingUrl,
      orderId      : data.orderId,
      ctaLabel     : "Voir le statut d'expédition",
      customerName : data.customerName,
      customerEmail: data.customerEmail,
      amount       : data.amount,
      items        : data.items,
      createdAt    : data.createdAt,
      activeStep   : 1,
      bodyExtra    : `<table role="presentation" cellspacing="0" cellpadding="0"
          style="background:#fdf8f2;border-left:3px solid #f5a623;width:100%;border-radius:0 4px 4px 0;">
          <tr><td style="padding:14px 18px;">
            <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.15em;">Livraison estimée</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#6b0f1a;">Dans les 2–3 jours ouvrés &middot; ${data.city}</p>
          </td></tr>
        </table>`,
    }),
  };
}

export function emailDay2(data: EmailData): { subject: string; html: string } {
  return {
    subject: `🏭 Commande ${data.orderId} arrivée au centre de distribution`,
    html: shell({
      badgeLabel   : "Centre de distribution",
      headline     : `Votre commande est presque là`,
      preheader    : `Votre commande ${data.orderId} est au centre de distribution. Livraison demain.`,
      trackingUrl  : data.trackingUrl,
      orderId      : data.orderId,
      ctaLabel     : "Voir le statut d'expédition",
      customerName : data.customerName,
      customerEmail: data.customerEmail,
      amount       : data.amount,
      items        : data.items,
      createdAt    : data.createdAt,
      activeStep   : 2,
      bodyExtra    : `<table role="presentation" cellspacing="0" cellpadding="0"
          style="background:#fdf8f2;border-left:3px solid #f5a623;width:100%;border-radius:0 4px 4px 0;">
          <tr><td style="padding:14px 18px;">
            <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.15em;">Prochaine étape</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#6b0f1a;">Livraison demain dans votre secteur &middot; ${data.city}</p>
          </td></tr>
        </table>`,
    }),
  };
}

export function emailDay3(data: EmailData): { subject: string; html: string } {
  return {
    subject: `🚚 Votre commande ${data.orderId} est en livraison AUJOURD'HUI`,
    html: shell({
      badgeLabel   : "En livraison aujourd'hui",
      headline     : `Votre commande arrive aujourd'hui`,
      preheader    : `Le livreur est en route avec votre commande ${data.orderId}. Préparez-vous à la recevoir !`,
      trackingUrl  : data.trackingUrl,
      orderId      : data.orderId,
      ctaLabel     : "Suivre la livraison en direct",
      customerName : data.customerName,
      customerEmail: data.customerEmail,
      amount       : data.amount,
      items        : data.items,
      createdAt    : data.createdAt,
      activeStep   : 3,
      bodyExtra    : `<table role="presentation" cellspacing="0" cellpadding="0"
          style="background:#6b0f1a;width:100%;border-radius:4px;">
          <tr><td style="padding:16px 24px;text-align:center;">
            <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:9px;color:rgba(255,255,255,0.55);text-transform:uppercase;letter-spacing:0.22em;">Statut actuel</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:15px;font-weight:800;color:#ffffff;letter-spacing:0.06em;">EN LIVRAISON · ${data.city.toUpperCase()}</p>
          </td></tr>
        </table>
        <p style="margin:10px 0 0;font-family:Arial,sans-serif;font-size:11px;color:#9ca3af;line-height:1.6;text-align:center;">Si vous n'êtes pas disponible, le livreur laissera un avis de passage pour planifier une nouvelle tentative.</p>`,
    }),
  };
}

export function emailDay5(data: EmailData): { subject: string; html: string } {
  return {
    subject: `⚠️ Information importante concernant votre commande ${data.orderId}`,
    html: shell({
      badgeLabel   : "Avis de retard",
      headline     : `Mise à jour de votre commande`,
      preheader    : `Votre commande ${data.orderId} accuse un léger retard. Nous vous prions de nous excuser.`,
      trackingUrl  : data.trackingUrl,
      orderId      : data.orderId,
      ctaLabel     : "Voir le statut actuel de la commande",
      customerName : data.customerName,
      customerEmail: data.customerEmail,
      amount       : data.amount,
      items        : data.items,
      createdAt    : data.createdAt,
      activeStep   : 4,
      bodyExtra    : `<table role="presentation" cellspacing="0" cellpadding="0"
          style="background:#fff8f3;border:1px solid #fad0b8;width:100%;border-radius:4px;margin-bottom:12px;">
          <tr><td style="padding:16px 20px;">
            <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:10px;color:#6b0f1a;text-transform:uppercase;letter-spacing:0.15em;font-weight:700;">&#9888; Retard &middot; ${data.city}</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#4b5563;line-height:1.65;">Votre commande <strong>${data.orderId}</strong> accuse un léger retard. Nous prévoyons la livraison dans les 24–48 heures. Nous vous prions de nous excuser pour ce désagrément.</p>
          </td></tr>
        </table>
        <table role="presentation" cellspacing="0" cellpadding="0"
          style="background:#f0fff6;border-left:3px solid #16a34a;width:100%;border-radius:0 4px 4px 0;">
          <tr><td style="padding:14px 18px;">
            <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.15em;">En guise d'excuse</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#16a34a;">10 % de réduction sur votre prochaine commande &mdash; Code : <span style="font-family:'Courier New',monospace;background:#e8f5ed;padding:2px 6px;border-radius:3px;color:#6b0f1a;">PANINI10</span></p>
          </td></tr>
        </table>`,
    }),
  };
}

export function emailDay6(data: EmailData): { subject: string; html: string } {
  return {
    subject: `🔍 Localisation de votre commande ${data.orderId} en cours — Panini France`,
    html: shell({
      badgeLabel   : "Localisation du colis",
      headline     : `Nous recherchons votre commande`,
      preheader    : `Le signal de suivi de la commande ${data.orderId} a été temporairement perdu. Notre équipe travaille à la résolution.`,
      trackingUrl  : data.trackingUrl,
      orderId      : data.orderId,
      ctaLabel     : "Voir le statut de localisation",
      customerName : data.customerName,
      customerEmail: data.customerEmail,
      amount       : data.amount,
      items        : data.items,
      createdAt    : data.createdAt,
      activeStep   : 5,
      bodyExtra    : `<table role="presentation" cellspacing="0" cellpadding="0"
          style="background:#f0f5ff;border:1px solid #c7d7f5;width:100%;border-radius:4px;margin-bottom:12px;">
          <tr><td style="padding:16px 20px;">
            <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:10px;color:#3a5fa0;text-transform:uppercase;letter-spacing:0.15em;font-weight:700;">&#128269; Signal de suivi interrompu</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#4b5563;line-height:1.65;">Le système a temporairement perdu le signal du colis lors du transfert en hub. Nous prévoyons la récupération dans les <strong>2–4 heures</strong> à venir.</p>
          </td></tr>
        </table>
        <table role="presentation" cellspacing="0" cellpadding="0"
          style="background:#fdf8f2;border-left:3px solid #f5a623;width:100%;border-radius:0 4px 4px 0;">
          <tr><td style="padding:14px 18px;">
            <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.15em;">Aucune action requise</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#6b0f1a;">Votre colis est en transit et sera localisé prochainement.</p>
          </td></tr>
        </table>`,
    }),
  };
}

export function emailDay7(data: EmailData): { subject: string; html: string } {
  return {
    subject: `📦 Votre colis est en contrôle douanier — Commande ${data.orderId}`,
    html: shell({
      badgeLabel   : "Contrôle douanier",
      headline     : `Votre commande est en contrôle douanier`,
      preheader    : `Votre commande ${data.orderId} est en contrôle douanier. Résolution sous 24–48 heures.`,
      trackingUrl  : data.trackingUrl,
      orderId      : data.orderId,
      ctaLabel     : "Vérifier le statut douanier",
      customerName : data.customerName,
      customerEmail: data.customerEmail,
      amount       : data.amount,
      items        : data.items,
      createdAt    : data.createdAt,
      activeStep   : 6,
      bodyExtra    : `<table role="presentation" cellspacing="0" cellpadding="0"
          style="background:#fdf8f2;border-left:3px solid #f5a623;width:100%;border-radius:0 4px 4px 0;margin-bottom:12px;">
          <tr><td style="padding:14px 18px;">
            <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.15em;">Référence douanière</p>
            <p style="margin:0;font-family:'Courier New',monospace;font-size:15px;font-weight:700;color:#6b0f1a;letter-spacing:0.1em;">FR-DOU-${data.orderId}-7</p>
          </td></tr>
        </table>
        <table role="presentation" cellspacing="0" cellpadding="0"
          style="background:#fffbee;border:1px solid #e8d88a;width:100%;border-radius:4px;">
          <tr><td style="padding:16px 20px;">
            <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:10px;color:#8a6d00;text-transform:uppercase;letter-spacing:0.15em;font-weight:700;">&#128203; Procédure standard &mdash; Aucun frais supplémentaire</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#4b5563;line-height:1.65;">Le contrôle douanier est une vérification standard. Votre commande n'est pas bloquée et ne nécessite aucun paiement supplémentaire. Résolution sous <strong>24–48 heures</strong>.</p>
          </td></tr>
        </table>`,
    }),
  };
}

export function emailDay8(data: EmailData): { subject: string; html: string } {
  return {
    subject: `⚠️ Confirmez votre adresse pour recevoir la commande ${data.orderId}`,
    html: shell({
      badgeLabel   : "Vérification d'adresse",
      headline     : `Nous devons confirmer votre adresse`,
      preheader    : `Action requise : confirmez l'adresse de livraison de la commande ${data.orderId} sous 24 heures.`,
      trackingUrl  : data.trackingUrl,
      orderId      : data.orderId,
      ctaLabel     : "Confirmer mon adresse",
      customerName : data.customerName,
      customerEmail: data.customerEmail,
      amount       : data.amount,
      items        : data.items,
      createdAt    : data.createdAt,
      activeStep   : 7,
      bodyExtra    : `<table role="presentation" cellspacing="0" cellpadding="0"
          style="background:#fff8f3;border:1px solid #fad0b8;width:100%;border-radius:4px;">
          <tr><td style="padding:16px 20px;">
            <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:10px;color:#6b0f1a;text-transform:uppercase;letter-spacing:0.15em;font-weight:700;">&#9888; Action requise sous 24 heures</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#4b5563;line-height:1.65;">Le livreur n'a pas pu vérifier l'adresse de livraison de la commande <strong>${data.orderId}</strong>. Cliquez sur le bouton ci-dessous pour confirmer vos coordonnées et planifier la livraison.</p>
          </td></tr>
        </table>`,
    }),
  };
}

export function emailDay9(data: EmailData): { subject: string; html: string } {
  return {
    subject: `✅ Bonne nouvelle — Votre commande ${data.orderId} a été relancée`,
    html: shell({
      badgeLabel   : "Commande relancée",
      headline     : `Votre commande est de nouveau en mouvement`,
      preheader    : `Bonne nouvelle ! Votre commande ${data.orderId} a repris son itinéraire de livraison.`,
      trackingUrl  : data.trackingUrl,
      orderId      : data.orderId,
      ctaLabel     : "Suivre le nouvel itinéraire",
      customerName : data.customerName,
      customerEmail: data.customerEmail,
      amount       : data.amount,
      items        : data.items,
      createdAt    : data.createdAt,
      activeStep   : 8,
      bodyExtra    : `<table role="presentation" cellspacing="0" cellpadding="0"
          style="background:#f0fff6;border:1px solid #a8d5b5;width:100%;border-radius:4px;">
          <tr><td style="padding:16px 20px;">
            <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:10px;color:#16a34a;text-transform:uppercase;letter-spacing:0.15em;font-weight:700;">&#10003; Commande relancée avec succès</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#4b5563;line-height:1.65;">Votre commande <strong>${data.orderId}</strong> a passé tous les contrôles et est de nouveau en transit vers <strong>${data.city}</strong>. Nous prévoyons la livraison dans les 24–48 heures.</p>
          </td></tr>
        </table>`,
    }),
  };
}

export function emailDay10(data: EmailData): { subject: string; html: string } {
  return {
    subject: `🎉 Votre commande ${data.orderId} arrive bientôt !`,
    html: shell({
      badgeLabel   : "Livraison imminente",
      headline     : `La livraison est imminente`,
      preheader    : `Votre commande ${data.orderId} est presque là. Le livreur est dans votre secteur.`,
      trackingUrl  : data.trackingUrl,
      orderId      : data.orderId,
      ctaLabel     : "Suivre la livraison finale",
      customerName : data.customerName,
      customerEmail: data.customerEmail,
      amount       : data.amount,
      items        : data.items,
      createdAt    : data.createdAt,
      activeStep   : 9,
      bodyExtra    : `<table role="presentation" cellspacing="0" cellpadding="0"
          style="background:#6b0f1a;width:100%;border-radius:4px;">
          <tr><td style="padding:16px 24px;text-align:center;">
            <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:9px;color:rgba(255,255,255,0.55);text-transform:uppercase;letter-spacing:0.22em;">Statut actuel</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:15px;font-weight:800;color:#ffffff;letter-spacing:0.06em;">LIVRAISON IMMINENTE · ${data.city.toUpperCase()}</p>
          </td></tr>
        </table>`,
    }),
  };
}

export function emailDayNonConsegnato(data: EmailData): { subject: string; html: string } {
  return {
    subject: `📋 Mise à jour de livraison — Commande ${data.orderId}`,
    html: shell({
      badgeLabel   : "Tentative de livraison",
      headline     : `Nous n'avons pas pu livrer aujourd'hui`,
      preheader    : `Le livreur a tenté de livrer la commande ${data.orderId} mais personne n'était disponible.`,
      trackingUrl  : data.trackingUrl,
      orderId      : data.orderId,
      ctaLabel     : "Planifier une nouvelle livraison",
      customerName : data.customerName,
      customerEmail: data.customerEmail,
      amount       : data.amount,
      items        : data.items,
      createdAt    : data.createdAt,
      activeStep   : 9,
      bodyExtra    : `<table role="presentation" cellspacing="0" cellpadding="0"
          style="background:#fff8f3;border:1px solid #fad0b8;width:100%;border-radius:4px;">
          <tr><td style="padding:16px 20px;">
            <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:10px;color:#6b0f1a;text-transform:uppercase;letter-spacing:0.15em;font-weight:700;">Tentative de livraison échouée</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#4b5563;line-height:1.65;">Le livreur a tenté de livrer la commande <strong>${data.orderId}</strong> mais personne n'était disponible. Cliquez ci-dessous pour planifier une nouvelle tentative.</p>
          </td></tr>
        </table>`,
    }),
  };
}

export function emailDayDiNuovoInRotta(data: EmailData): { subject: string; html: string } {
  return {
    subject: `🔄 Votre commande ${data.orderId} est de nouveau en route`,
    html: shell({
      badgeLabel   : "De nouveau en route",
      headline     : `Nouvelle tentative de livraison planifiée`,
      preheader    : `Votre commande ${data.orderId} a été réacheminée. Nouvelle tentative bientôt.`,
      trackingUrl  : data.trackingUrl,
      orderId      : data.orderId,
      ctaLabel     : "Voir le statut mis à jour",
      customerName : data.customerName,
      customerEmail: data.customerEmail,
      amount       : data.amount,
      items        : data.items,
      createdAt    : data.createdAt,
      activeStep   : 9,
      bodyExtra    : `<table role="presentation" cellspacing="0" cellpadding="0"
          style="background:#f0fff6;border:1px solid #a8d5b5;width:100%;border-radius:4px;">
          <tr><td style="padding:16px 20px;">
            <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:10px;color:#16a34a;text-transform:uppercase;letter-spacing:0.15em;font-weight:700;">&#128260; Nouvelle tentative planifiée</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#4b5563;line-height:1.65;">Votre commande <strong>${data.orderId}</strong> a été réacheminée. Un livreur se présentera dans les <strong>24 heures</strong>. Veuillez vous assurer que quelqu'un est disponible pour la réceptionner.</p>
          </td></tr>
        </table>`,
    }),
  };
}
