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

const ASSET_BASE = (process.env.TRACKING_BASE_URL || "https://panini-it.site").replace(/\/$/, "");
const LOGO_URL   = `${ASSET_BASE}/assets/logo-panini-oficial.png`;

/* ── Official Panini brand palette ── */
const C = {
  yellow  : "#f5c800",   /* Panini logo background */
  red     : "#c8102e",   /* Panini logo text red */
  burgundy: "#6b0f1a",   /* dark accent / funnel primary */
  green   : "#16a34a",   /* CTA / positive steps */
  greenD  : "#15803d",
  amber   : "#f5a623",   /* gold accent line */
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

const STEPS = [
  { label: "Conferma dell'ordine",         sub: "Ordine elaborato con successo" },
  { label: "Ordine in viaggio",             sub: "Partito dal magazzino" },
  { label: "Centro di distribuzione",       sub: "Hub logistico" },
  { label: "In consegna nella tua città",   sub: "Corriere in zona" },
  { label: "Primo tentativo di consegna",   sub: "Piccolo ritardo in corso" },
  { label: "Localizzazione in corso",       sub: "Segnale in recupero" },
  { label: "Controllo doganale",            sub: "In revisione standard" },
  { label: "Verifica dell'indirizzo",       sub: "In attesa di conferma" },
  { label: "Ordine rilanciato",             sub: "Nuovo percorso assegnato" },
  { label: "Consegna imminente",            sub: "Corriere in arrivo" },
];
const OFFSETS = [0, 1, 2, 3, 5, 6, 7, 8, 9, 10];

function fmtDate(d: Date) {
  return d.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

/* ── Timeline rendered as email-safe HTML table ── */
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
      ? `<span style="color:${C.green};font-size:10px;">&#10003; Completato &mdash; ${fmtDate(stepDate)}</span>`
      : active
      ? `<span style="color:${C.burgundy};font-size:10px;font-weight:600;">&#9654; In corso &mdash; ${step.sub}</span>`
      : `<span style="color:#c4c9d1;font-size:10px;">Previsto: ${fmtDate(stepDate)}</span>`;

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

/* ── Product row list ── */
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
   SHELL — full email wrapper
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

  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${opts.preheader}</title>
</head>
<body style="margin:0;padding:0;background:#f0ece8;-webkit-text-size-adjust:100%;">
<div style="display:none;font-size:1px;max-height:0;overflow:hidden;color:#f0ece8;">${opts.preheader}</div>

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#f0ece8">
<tr><td align="center" style="padding:28px 12px 48px;">
  <table role="presentation" width="600" cellspacing="0" cellpadding="0"
         style="max-width:600px;width:100%;border-radius:3px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

    <!-- ━━━ TOP HEADER — WHITE + BIG YELLOW LOGO ━━━ -->
    <tr>
      <td style="background:#ffffff;padding:0;">
        <!-- Amber top accent -->
        <div style="height:5px;background:linear-gradient(90deg,${C.amber} 0%,${C.yellow} 50%,${C.amber} 100%);"></div>

        <!-- Logo area -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="padding:28px 40px 20px;">
              <!-- Logo on subtle warm pill -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="display:inline-table;">
                <tr>
                  <td style="background:#fdf6e3;border:2px solid ${C.amber};border-radius:6px;padding:10px 28px;">
                    <img src="${LOGO_URL}"
                         alt="Panini"
                         width="160"
                         height="auto"
                         style="display:block;max-width:160px;height:auto;border:0;" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Badge strip -->
          <tr>
            <td style="background:${C.burgundy};padding:8px 0;text-align:center;">
              <span style="font-family:Arial,Helvetica,sans-serif;font-size:9px;font-weight:700;color:rgba(255,255,255,0.90);letter-spacing:0.28em;text-transform:uppercase;">${opts.badgeLabel}</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- ━━━ ORDER CODE HERO ━━━ -->
    <tr>
      <td style="background:${C.warm50};padding:24px 40px;text-align:center;border-top:0;border-bottom:3px solid ${C.amber};">
        <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:9px;font-weight:600;color:${C.gray400};text-transform:uppercase;letter-spacing:0.25em;">Codice ordine</p>
        <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:30px;font-weight:700;color:${C.burgundy};letter-spacing:0.16em;">${opts.orderId}</p>
        <p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:10px;color:${C.gray400};">${orderDate}</p>
      </td>
    </tr>

    <!-- ━━━ GREETING ━━━ -->
    <tr>
      <td style="background:#ffffff;padding:30px 40px 24px;border-bottom:1px solid #f0ebe6;">
        <p style="margin:0 0 4px;font-family:Arial,Helvetica,sans-serif;font-size:9px;font-weight:700;color:${C.green};text-transform:uppercase;letter-spacing:0.18em;">Panini Italia · Licenziatario Ufficiale FIFA World Cup 26™</p>
        <h2 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:400;color:${C.burgundy};line-height:1.25;">${opts.headline}</h2>
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#4b5563;line-height:1.75;">
          Ciao <strong style="color:${C.burgundy};">${firstName}</strong>, ti confermiamo che il tuo ordine è stato ricevuto ed è in elaborazione.
        </p>

        ${opts.bodyExtra ? `<div style="margin-top:20px;">${opts.bodyExtra}</div>` : ""}

        <!-- Customer info pill -->
        <table role="presentation" cellspacing="0" cellpadding="0"
               style="margin-top:22px;width:100%;background:${C.warm50};border:1px solid #ecddd4;border-radius:4px;">
          <tr>
            <td style="padding:14px 20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="font-family:Arial,Helvetica,sans-serif;font-size:10px;color:${C.gray400};text-transform:uppercase;letter-spacing:0.15em;width:80px;">Cliente</td>
                  <td style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${C.burgundy};font-weight:700;">${opts.customerName}</td>
                </tr>
                <tr>
                  <td style="font-family:Arial,Helvetica,sans-serif;font-size:10px;color:${C.gray400};text-transform:uppercase;letter-spacing:0.15em;padding-top:6px;">Email</td>
                  <td style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${C.gray500};padding-top:6px;">${opts.customerEmail}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- ━━━ PRODUCTS ━━━ -->
    ${opts.items.length > 0 ? `
    <tr>
      <td style="background:#ffffff;padding:24px 40px;border-bottom:1px solid #f0ebe6;">
        <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:9px;font-weight:700;color:${C.gray400};text-transform:uppercase;letter-spacing:0.22em;">Articoli dell'ordine</p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          ${buildProductRows(opts.items)}
          <tr>
            <td style="padding:16px 0 0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
                     style="border-top:2px solid ${C.amber};padding-top:14px;">
                <tr>
                  <td style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:${C.gray400};padding-top:14px;">Totale pagato · IVA inclusa</td>
                  <td align="right" style="font-family:Arial,Helvetica,sans-serif;font-size:24px;font-weight:800;color:${C.burgundy};padding-top:10px;">&euro;&nbsp;${opts.amount}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>` : ""}

    <!-- ━━━ TIMELINE ━━━ -->
    <tr>
      <td style="background:${C.offWhite};padding:26px 40px 30px;border-bottom:1px solid #eee8e0;">
        <p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:9px;font-weight:700;color:${C.gray400};text-transform:uppercase;letter-spacing:0.22em;">Stato della tua spedizione</p>
        ${buildEmailTimeline(opts.activeStep, opts.createdAt)}
      </td>
    </tr>

    <!-- ━━━ CTA ━━━ -->
    <tr>
      <td style="background:#ffffff;padding:36px 40px;text-align:center;border-bottom:1px solid #f0ebe6;">
        <a href="${opts.trackingUrl}" target="_blank"
           style="display:inline-block;background-color:${C.green};color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;padding:16px 48px;border-radius:4px;letter-spacing:0.04em;"
        >${opts.ctaLabel}</a>
        <br><br>
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:10px;color:#c0c0c0;">oppure copia questo link:</p>
        <a href="${opts.trackingUrl}" target="_blank"
           style="font-family:'Courier New',monospace;font-size:9px;color:${C.green};text-decoration:none;word-break:break-all;"
        >${opts.trackingUrl}</a>
      </td>
    </tr>

    <!-- ━━━ FOOTER ━━━ -->
    <tr>
      <td style="background:#fdf8f2;padding:0;">
        <!-- Amber top line -->
        <div style="height:3px;background:linear-gradient(90deg,${C.amber} 0%,${C.yellow} 50%,${C.amber} 100%);"></div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="padding:20px 40px 24px;">
              <img src="${LOGO_URL}" alt="Panini" width="80"
                   style="max-width:80px;height:auto;display:block;margin:0 auto 12px;opacity:0.85;border:0;" />
              <p style="margin:0 0 5px;font-family:Arial,Helvetica,sans-serif;font-size:9px;color:#b0a898;letter-spacing:0.20em;text-transform:uppercase;">Panini Italia Srl &middot; Assistenza Clienti</p>
              <p style="margin:0 0 5px;font-family:Arial,Helvetica,sans-serif;font-size:10px;color:#c0b8af;line-height:1.6;">Reso gratuito entro 30 giorni &middot; Spedizione gratuita in tutta Italia</p>
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:9px;color:#d0c8c0;">&copy; ${year} Panini Italia Srl &middot; Tutti i diritti riservati &middot; Licenziatario ufficiale FIFA</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

  </table>
</td></tr>
</table>
</body>
</html>`;
}

/* ══════════════════════════════════════════════════════════
   Individual email builders — all 12 variants
   ══════════════════════════════════════════════════════════ */

export function emailDay0(data: EmailData): { subject: string; html: string } {
  return {
    subject: `✓ Ordine ${data.orderId} confermato — Panini Italia`,
    html: shell({
      badgeLabel   : "Conferma dell'ordine",
      headline     : `Il tuo ordine è confermato`,
      preheader    : `Ordine ${data.orderId} confermato. Grazie per il tuo acquisto su Panini Italia.`,
      trackingUrl  : data.trackingUrl,
      orderId      : data.orderId,
      ctaLabel     : "Segui il mio ordine in tempo reale",
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
    subject: `📦 Il tuo ordine ${data.orderId} è in viaggio — Panini Italia`,
    html: shell({
      badgeLabel   : "Ordine in viaggio",
      headline     : `Il tuo ordine è in transito`,
      preheader    : `Il tuo ordine ${data.orderId} ha lasciato il magazzino ed è diretto a ${data.city}.`,
      trackingUrl  : data.trackingUrl,
      orderId      : data.orderId,
      ctaLabel     : "Vedi lo stato della spedizione",
      customerName : data.customerName,
      customerEmail: data.customerEmail,
      amount       : data.amount,
      items        : data.items,
      createdAt    : data.createdAt,
      activeStep   : 1,
      bodyExtra    : `<table role="presentation" cellspacing="0" cellpadding="0"
          style="background:#fdf8f2;border-left:3px solid #f5a623;width:100%;border-radius:0 4px 4px 0;">
          <tr><td style="padding:14px 18px;">
            <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.15em;">Consegna stimata</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#6b0f1a;">Nei prossimi 2–3 giorni lavorativi · ${data.city}</p>
          </td></tr>
        </table>`,
    }),
  };
}

export function emailDay2(data: EmailData): { subject: string; html: string } {
  return {
    subject: `🏭 Ordine ${data.orderId} arrivato al centro di distribuzione`,
    html: shell({
      badgeLabel   : "Centro di distribuzione",
      headline     : `Il tuo ordine è quasi arrivato`,
      preheader    : `Il tuo ordine ${data.orderId} è al centro di distribuzione. Consegna domani.`,
      trackingUrl  : data.trackingUrl,
      orderId      : data.orderId,
      ctaLabel     : "Vedi lo stato della spedizione",
      customerName : data.customerName,
      customerEmail: data.customerEmail,
      amount       : data.amount,
      items        : data.items,
      createdAt    : data.createdAt,
      activeStep   : 2,
      bodyExtra    : `<table role="presentation" cellspacing="0" cellpadding="0"
          style="background:#fdf8f2;border-left:3px solid #f5a623;width:100%;border-radius:0 4px 4px 0;">
          <tr><td style="padding:14px 18px;">
            <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.15em;">Prossimo passo</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#6b0f1a;">Domani inizia la consegna nella tua zona · ${data.city}</p>
          </td></tr>
        </table>`,
    }),
  };
}

export function emailDay3(data: EmailData): { subject: string; html: string } {
  return {
    subject: `🚚 Il tuo ordine ${data.orderId} è in consegna OGGI`,
    html: shell({
      badgeLabel   : "In consegna oggi",
      headline     : `Il tuo ordine arriva oggi`,
      preheader    : `Il corriere è in viaggio con il tuo ordine ${data.orderId}. Preparati a riceverlo!`,
      trackingUrl  : data.trackingUrl,
      orderId      : data.orderId,
      ctaLabel     : "Segui la consegna in diretta",
      customerName : data.customerName,
      customerEmail: data.customerEmail,
      amount       : data.amount,
      items        : data.items,
      createdAt    : data.createdAt,
      activeStep   : 3,
      bodyExtra    : `<table role="presentation" cellspacing="0" cellpadding="0"
          style="background:#6b0f1a;width:100%;border-radius:4px;">
          <tr><td style="padding:16px 24px;text-align:center;">
            <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:9px;color:rgba(255,255,255,0.55);text-transform:uppercase;letter-spacing:0.22em;">Stato attuale</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:15px;font-weight:800;color:#ffffff;letter-spacing:0.06em;">IN CONSEGNA · ${data.city.toUpperCase()}</p>
          </td></tr>
        </table>
        <p style="margin:10px 0 0;font-family:Arial,sans-serif;font-size:11px;color:#9ca3af;line-height:1.6;text-align:center;">Se non sei disponibile, il corriere lascerà un avviso per concordare una nuova consegna.</p>`,
    }),
  };
}

export function emailDay5(data: EmailData): { subject: string; html: string } {
  return {
    subject: `⚠️ Avviso importante sul tuo ordine ${data.orderId}`,
    html: shell({
      badgeLabel   : "Avviso di ritardo",
      headline     : `Aggiornamento sul tuo ordine`,
      preheader    : `Il tuo ordine ${data.orderId} presenta un piccolo ritardo. Ci scusiamo per l'inconveniente.`,
      trackingUrl  : data.trackingUrl,
      orderId      : data.orderId,
      ctaLabel     : "Vedi lo stato attuale dell'ordine",
      customerName : data.customerName,
      customerEmail: data.customerEmail,
      amount       : data.amount,
      items        : data.items,
      createdAt    : data.createdAt,
      activeStep   : 4,
      bodyExtra    : `<table role="presentation" cellspacing="0" cellpadding="0"
          style="background:#fff8f3;border:1px solid #fad0b8;width:100%;border-radius:4px;margin-bottom:12px;">
          <tr><td style="padding:16px 20px;">
            <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:10px;color:#6b0f1a;text-transform:uppercase;letter-spacing:0.15em;font-weight:700;">&#9888; Ritardo · ${data.city}</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#4b5563;line-height:1.65;">Il tuo ordine <strong>${data.orderId}</strong> subisce un piccolo ritardo. Prevediamo la consegna nelle prossime 24–48 ore. Ci scusiamo per l'inconveniente.</p>
          </td></tr>
        </table>
        <table role="presentation" cellspacing="0" cellpadding="0"
          style="background:#f0fff6;border-left:3px solid #16a34a;width:100%;border-radius:0 4px 4px 0;">
          <tr><td style="padding:14px 18px;">
            <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.15em;">Come scuse</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#16a34a;">10% di sconto sul prossimo acquisto &mdash; Codice: <span style="font-family:'Courier New',monospace;background:#e8f5ed;padding:2px 6px;border-radius:3px;color:#6b0f1a;">PANINI10</span></p>
          </td></tr>
        </table>`,
    }),
  };
}

export function emailDay6(data: EmailData): { subject: string; html: string } {
  return {
    subject: `🔍 Stiamo localizzando il tuo ordine ${data.orderId} — Panini Italia`,
    html: shell({
      badgeLabel   : "Localizzazione in corso",
      headline     : `Stiamo cercando il tuo ordine`,
      preheader    : `Abbiamo perso il segnale del tuo ordine ${data.orderId}. Il team sta lavorando per risolvere.`,
      trackingUrl  : data.trackingUrl,
      orderId      : data.orderId,
      ctaLabel     : "Vedi lo stato della localizzazione",
      customerName : data.customerName,
      customerEmail: data.customerEmail,
      amount       : data.amount,
      items        : data.items,
      createdAt    : data.createdAt,
      activeStep   : 5,
      bodyExtra    : `<table role="presentation" cellspacing="0" cellpadding="0"
          style="background:#f0f5ff;border:1px solid #c7d7f5;width:100%;border-radius:4px;margin-bottom:12px;">
          <tr><td style="padding:16px 20px;">
            <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:10px;color:#3a5fa0;text-transform:uppercase;letter-spacing:0.15em;font-weight:700;">&#128269; Segnale di tracciamento interrotto</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#4b5563;line-height:1.65;">Il sistema ha perso temporaneamente il segnale del pacco durante il trasferimento tra hub. Prevediamo il recupero nelle prossime <strong>2–4 ore</strong>.</p>
          </td></tr>
        </table>
        <table role="presentation" cellspacing="0" cellpadding="0"
          style="background:#fdf8f2;border-left:3px solid #f5a623;width:100%;border-radius:0 4px 4px 0;">
          <tr><td style="padding:14px 18px;">
            <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.15em;">Nessuna azione richiesta</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#6b0f1a;">Il tuo pacco è in transito e sarà localizzato a breve.</p>
          </td></tr>
        </table>`,
    }),
  };
}

export function emailDay7(data: EmailData): { subject: string; html: string } {
  return {
    subject: `📦 Il tuo pacco è in controllo doganale — Ordine ${data.orderId}`,
    html: shell({
      badgeLabel   : "Controllo doganale",
      headline     : `Il tuo ordine è in revisione doganale`,
      preheader    : `Il tuo ordine ${data.orderId} è in controllo doganale. Risoluzione in 24–48 ore.`,
      trackingUrl  : data.trackingUrl,
      orderId      : data.orderId,
      ctaLabel     : "Consulta lo stato doganale",
      customerName : data.customerName,
      customerEmail: data.customerEmail,
      amount       : data.amount,
      items        : data.items,
      createdAt    : data.createdAt,
      activeStep   : 6,
      bodyExtra    : `<table role="presentation" cellspacing="0" cellpadding="0"
          style="background:#fdf8f2;border-left:3px solid #f5a623;width:100%;border-radius:0 4px 4px 0;margin-bottom:12px;">
          <tr><td style="padding:14px 18px;">
            <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.15em;">Riferimento doganale</p>
            <p style="margin:0;font-family:'Courier New',monospace;font-size:15px;font-weight:700;color:#6b0f1a;letter-spacing:0.1em;">IT-DOG-${data.orderId}-7</p>
          </td></tr>
        </table>
        <table role="presentation" cellspacing="0" cellpadding="0"
          style="background:#fffbee;border:1px solid #e8d88a;width:100%;border-radius:4px;">
          <tr><td style="padding:16px 20px;">
            <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:10px;color:#8a6d00;text-transform:uppercase;letter-spacing:0.15em;font-weight:700;">&#128203; Procedura standard &mdash; Nessun costo aggiuntivo</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#4b5563;line-height:1.65;">Il controllo doganale è una verifica standard. Il tuo ordine non è bloccato e non richiede pagamenti aggiuntivi. Risoluzione entro <strong>24–48 ore</strong>.</p>
          </td></tr>
        </table>`,
    }),
  };
}

export function emailDay8(data: EmailData): { subject: string; html: string } {
  return {
    subject: `⚠️ Conferma il tuo indirizzo per ricevere l'ordine ${data.orderId}`,
    html: shell({
      badgeLabel   : "Verifica dell'indirizzo",
      headline     : `Dobbiamo confermare il tuo indirizzo`,
      preheader    : `Azione richiesta: conferma l'indirizzo di consegna per l'ordine ${data.orderId} entro 24 ore.`,
      trackingUrl  : data.trackingUrl,
      orderId      : data.orderId,
      ctaLabel     : "Conferma il mio indirizzo",
      customerName : data.customerName,
      customerEmail: data.customerEmail,
      amount       : data.amount,
      items        : data.items,
      createdAt    : data.createdAt,
      activeStep   : 7,
      bodyExtra    : `<table role="presentation" cellspacing="0" cellpadding="0"
          style="background:#fff8f3;border:1px solid #fad0b8;width:100%;border-radius:4px;">
          <tr><td style="padding:16px 20px;">
            <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:10px;color:#6b0f1a;text-transform:uppercase;letter-spacing:0.15em;font-weight:700;">&#9888; Azione richiesta entro 24 ore</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#4b5563;line-height:1.65;">Il corriere non ha potuto verificare l'indirizzo di consegna per l'ordine <strong>${data.orderId}</strong>. Clicca il pulsante qui sotto per confermare i dati e programmare la consegna.</p>
          </td></tr>
        </table>`,
    }),
  };
}

export function emailDay9(data: EmailData): { subject: string; html: string } {
  return {
    subject: `✅ Buone notizie — Il tuo ordine ${data.orderId} è stato rilanciato`,
    html: shell({
      badgeLabel   : "Ordine rilanciato",
      headline     : `Il tuo ordine è di nuovo in movimento`,
      preheader    : `Buone notizie! Il tuo ordine ${data.orderId} ha ripreso il percorso di consegna.`,
      trackingUrl  : data.trackingUrl,
      orderId      : data.orderId,
      ctaLabel     : "Segui il nuovo percorso",
      customerName : data.customerName,
      customerEmail: data.customerEmail,
      amount       : data.amount,
      items        : data.items,
      createdAt    : data.createdAt,
      activeStep   : 8,
      bodyExtra    : `<table role="presentation" cellspacing="0" cellpadding="0"
          style="background:#f0fff6;border:1px solid #a8d5b5;width:100%;border-radius:4px;">
          <tr><td style="padding:16px 20px;">
            <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:10px;color:#16a34a;text-transform:uppercase;letter-spacing:0.15em;font-weight:700;">&#10003; Ordine rilanciato con successo</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#4b5563;line-height:1.65;">Il tuo ordine <strong>${data.orderId}</strong> ha superato tutti i controlli ed è tornato in transito verso <strong>${data.city}</strong>. Prevediamo la consegna nelle prossime 24–48 ore.</p>
          </td></tr>
        </table>`,
    }),
  };
}

export function emailDay10(data: EmailData): { subject: string; html: string } {
  return {
    subject: `🎉 Il tuo ordine ${data.orderId} arriverà presto!`,
    html: shell({
      badgeLabel   : "Consegna imminente",
      headline     : `La consegna è imminente`,
      preheader    : `Il tuo ordine ${data.orderId} sta per arrivare. Il corriere è in zona.`,
      trackingUrl  : data.trackingUrl,
      orderId      : data.orderId,
      ctaLabel     : "Segui la consegna finale",
      customerName : data.customerName,
      customerEmail: data.customerEmail,
      amount       : data.amount,
      items        : data.items,
      createdAt    : data.createdAt,
      activeStep   : 9,
      bodyExtra    : `<table role="presentation" cellspacing="0" cellpadding="0"
          style="background:#6b0f1a;width:100%;border-radius:4px;">
          <tr><td style="padding:16px 24px;text-align:center;">
            <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:9px;color:rgba(255,255,255,0.55);text-transform:uppercase;letter-spacing:0.22em;">Stato attuale</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:15px;font-weight:800;color:#ffffff;letter-spacing:0.06em;">CONSEGNA IMMINENTE · ${data.city.toUpperCase()}</p>
          </td></tr>
        </table>`,
    }),
  };
}

export function emailDayNonConsegnato(data: EmailData): { subject: string; html: string } {
  return {
    subject: `📋 Aggiornamento consegna — Ordine ${data.orderId}`,
    html: shell({
      badgeLabel   : "Tentativo di consegna",
      headline     : `Non eravamo presenti oggi`,
      preheader    : `Il corriere ha tentato la consegna dell'ordine ${data.orderId} ma non ha trovato nessuno.`,
      trackingUrl  : data.trackingUrl,
      orderId      : data.orderId,
      ctaLabel     : "Programma una nuova consegna",
      customerName : data.customerName,
      customerEmail: data.customerEmail,
      amount       : data.amount,
      items        : data.items,
      createdAt    : data.createdAt,
      activeStep   : 9,
      bodyExtra    : `<table role="presentation" cellspacing="0" cellpadding="0"
          style="background:#fff8f3;border:1px solid #fad0b8;width:100%;border-radius:4px;">
          <tr><td style="padding:16px 20px;">
            <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:10px;color:#6b0f1a;text-transform:uppercase;letter-spacing:0.15em;font-weight:700;">Tentativo di consegna non riuscito</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#4b5563;line-height:1.65;">Il corriere ha tentato di consegnare l'ordine <strong>${data.orderId}</strong> ma non ha trovato nessuno. Clicca qui sotto per programmare un nuovo tentativo.</p>
          </td></tr>
        </table>`,
    }),
  };
}

export function emailDayDiNuovoInRotta(data: EmailData): { subject: string; html: string } {
  return {
    subject: `🔄 Il tuo ordine ${data.orderId} è di nuovo in rotta`,
    html: shell({
      badgeLabel   : "Di nuovo in rotta",
      headline     : `Nuovo tentativo di consegna programmato`,
      preheader    : `Il tuo ordine ${data.orderId} è stato rimesso in rotta. Nuovo tentativo a breve.`,
      trackingUrl  : data.trackingUrl,
      orderId      : data.orderId,
      ctaLabel     : "Vedi lo stato aggiornato",
      customerName : data.customerName,
      customerEmail: data.customerEmail,
      amount       : data.amount,
      items        : data.items,
      createdAt    : data.createdAt,
      activeStep   : 9,
      bodyExtra    : `<table role="presentation" cellspacing="0" cellpadding="0"
          style="background:#f0fff6;border:1px solid #a8d5b5;width:100%;border-radius:4px;">
          <tr><td style="padding:16px 20px;">
            <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:10px;color:#16a34a;text-transform:uppercase;letter-spacing:0.15em;font-weight:700;">&#128260; Nuovo tentativo programmato</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#4b5563;line-height:1.65;">Il tuo ordine <strong>${data.orderId}</strong> è stato rimesso in rotta. Un corriere si presenterà nelle prossime <strong>24 ore</strong>. Assicurati di essere disponibile.</p>
          </td></tr>
        </table>`,
    }),
  };
}
