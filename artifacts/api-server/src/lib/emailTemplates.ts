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

const ASSET_BASE = (process.env.TRACKING_BASE_URL || "https://panini-it.herokuapp.com").replace(/\/$/, "");
const LOGO_URL   = `${ASSET_BASE}/assets/logo-panini-oficial.png`;

/* Brand palette — matches the funnel */
const C = {
  burgundy : "#6b0f1a",
  burgundyD: "#520c14",
  green    : "#16a34a",
  greenD   : "#15803d",
  amber    : "#f5a623",
  white    : "#ffffff",
  offWhite : "#f9f6f4",
  gray50   : "#f7f7f7",
  gray200  : "#e8e8e8",
  gray400  : "#999999",
  gray600  : "#555555",
  gray800  : "#222222",
} as const;

const STEPS = [
  { day: 0,  label: "Conferma dell'ordine",         sublabel: "Ordine elaborato" },
  { day: 1,  label: "Ordine in viaggio",             sublabel: "In transito" },
  { day: 2,  label: "Centro di distribuzione",       sublabel: "Hub logistico" },
  { day: 3,  label: "In consegna nella tua città",   sublabel: "Corriere assegnato" },
  { day: 5,  label: "Primo tentativo di consegna",   sublabel: "Tentativo fallito · Ritardo" },
  { day: 6,  label: "Localizzazione in corso",       sublabel: "Segnale in recupero" },
  { day: 7,  label: "Controllo doganale",            sublabel: "In revisione" },
  { day: 8,  label: "Verifica dell'indirizzo",       sublabel: "In attesa di conferma" },
  { day: 9,  label: "Ordine rilanciato",             sublabel: "Nuovo percorso assegnato" },
  { day: 10, label: "Consegna imminente",            sublabel: "Corriere in arrivo" },
];
const OFFSETS = [0, 1, 2, 3, 5, 6, 7, 8, 9, 10];

function fmtDate(d: Date) {
  return d.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function buildEmailTimeline(activeStepIndex: number, createdAt: string): string {
  const base = new Date(createdAt).getTime();
  const visibleCount = Math.max(5, activeStepIndex + 1);
  let rows = "";

  STEPS.slice(0, visibleCount).forEach((step, i) => {
    const done   = i < activeStepIndex;
    const active = i === activeStepIndex;
    const stepDate = new Date(base + OFFSETS[i] * 86400000);
    const isLast = i === visibleCount - 1;

    const dotStyle = done
      ? `width:22px;height:22px;border-radius:50%;background:${C.green};color:#fff;font-family:Arial,sans-serif;font-size:9px;font-weight:700;text-align:center;line-height:22px;`
      : active
      ? `width:20px;height:20px;border-radius:50%;background:#fff;border:2px solid ${C.burgundy};color:${C.burgundy};font-family:Arial,sans-serif;font-size:9px;font-weight:700;text-align:center;line-height:20px;`
      : `width:22px;height:22px;border-radius:50%;background:#e8e8e8;color:#aaa;font-family:Arial,sans-serif;font-size:9px;font-weight:700;text-align:center;line-height:22px;`;
    const dotText   = done ? "&#10003;" : String(i + 1);
    const lineBg    = done ? C.green : "#e5e5e5";
    const labelW    = done || active ? "700" : "400";
    const labelColor = done ? C.green : active ? C.burgundy : "#c0c0c0";
    const dateColor  = done ? C.gray600 : active ? C.burgundy : "#cccccc";
    const statusText = done
      ? `<span style="color:${C.green};font-weight:600;">&#10003; Completato</span>`
      : active
      ? `<strong style="color:${C.burgundy};">&#9654; In corso — ${step.sublabel}</strong>`
      : `Previsto: ${fmtDate(stepDate)}`;

    rows += `
    <tr>
      <td width="30" valign="top">
        <table role="presentation" cellspacing="0" cellpadding="0" style="width:30px;">
          <tr><td align="center"><div style="${dotStyle}">${dotText}</div></td></tr>
          ${!isLast ? `<tr><td align="center" style="padding:1px 0;"><div style="width:2px;height:26px;background:${lineBg};margin:0 auto;border-radius:1px;"></div></td></tr>` : ""}
        </table>
      </td>
      <td style="padding:2px 0 ${isLast ? "0" : "22px"} 14px;">
        <p style="margin:0;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:11px;font-weight:${labelW};color:${labelColor};text-transform:uppercase;letter-spacing:0.08em;">${step.label}</p>
        <p style="margin:4px 0 0;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:10px;color:${dateColor};line-height:1.4;">${statusText}</p>
      </td>
    </tr>`;
  });

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0">${rows}</table>`;
}

function buildProductRows(items: string[]): string {
  return items.map(item => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f0ebe8;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td width="8" valign="top" style="padding-top:5px;">
              <div style="width:5px;height:5px;background:${C.amber};border-radius:50%;"></div>
            </td>
            <td style="padding-left:10px;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:12px;color:${C.gray800};line-height:1.5;">${item}</td>
          </tr>
        </table>
      </td>
    </tr>`).join("");
}

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
<tr><td align="center" style="padding:32px 12px 48px;">
  <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:2px;overflow:hidden;box-shadow:0 2px 12px rgba(107,15,26,0.10);">

    <!-- ━━━ BURGUNDY HEADER ━━━ -->
    <tr>
      <td style="background:${C.burgundy};padding:0;">
        <!-- Top gold accent line -->
        <div style="height:4px;background:linear-gradient(90deg,${C.amber},#d4880a,${C.amber});"></div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding:24px 40px 18px;">
              <img src="${LOGO_URL}"
                   alt="Panini"
                   width="140"
                   style="max-width:140px;height:auto;display:block;border:0;"
              />
            </td>
          </tr>
          <!-- Badge -->
          <tr>
            <td align="center" style="padding:0 40px 20px;">
              <table role="presentation" cellspacing="0" cellpadding="0" style="display:inline-table;">
                <tr>
                  <td style="background:rgba(255,255,255,0.12);border-radius:20px;padding:5px 18px;">
                    <span style="font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:9px;font-weight:700;color:rgba(255,255,255,0.85);letter-spacing:0.22em;text-transform:uppercase;">${opts.badgeLabel}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- ━━━ ORDER CODE HERO ━━━ -->
    <tr>
      <td style="background:#fff8f3;padding:28px 40px;text-align:center;border-bottom:2px solid ${C.amber};">
        <p style="margin:0 0 6px;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:9px;color:${C.gray400};text-transform:uppercase;letter-spacing:0.22em;">Codice ordine</p>
        <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:28px;font-weight:700;color:${C.burgundy};letter-spacing:0.18em;">${opts.orderId}</p>
        <p style="margin:8px 0 0;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:10px;color:${C.gray400};">${orderDate}</p>
      </td>
    </tr>

    <!-- ━━━ GREETING ━━━ -->
    <tr>
      <td style="padding:32px 40px 24px;border-bottom:1px solid #f0ebe8;">
        <h1 style="margin:0 0 4px;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:11px;font-weight:700;color:${C.green};text-transform:uppercase;letter-spacing:0.15em;">Panini Italia · FIFA World Cup 26™</h1>
        <h2 style="margin:0 0 16px;font-family:'Times New Roman',Georgia,serif;font-size:26px;font-weight:400;color:${C.burgundy};line-height:1.2;">${opts.headline}</h2>
        <p style="margin:0 0 6px;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:13px;color:#444;line-height:1.75;">
          Ciao <strong style="color:${C.burgundy};">${firstName}</strong>, ti confermiamo che il tuo ordine è stato ricevuto ed è in elaborazione.
        </p>
        ${opts.bodyExtra ? `<div style="margin-top:18px;">${opts.bodyExtra}</div>` : ""}
        <!-- Customer pill -->
        <table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:20px;border:1px solid #ecddd8;background:#fdf8f6;border-radius:4px;">
          <tr>
            <td style="padding:12px 20px;">
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:0.15em;padding-right:20px;">Cliente</td>
                  <td style="font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:11px;color:${C.burgundy};font-weight:700;">${opts.customerName}</td>
                </tr>
                <tr>
                  <td style="font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:10px;color:#aaa;text-transform:uppercase;letter-spacing:0.15em;padding-right:20px;padding-top:5px;">Email</td>
                  <td style="font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:11px;color:${C.gray600};padding-top:5px;">${opts.customerEmail}</td>
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
      <td style="padding:26px 40px;border-bottom:1px solid #f0ebe8;">
        <p style="margin:0 0 14px;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:9px;color:${C.gray400};text-transform:uppercase;letter-spacing:0.2em;">Articoli dell'ordine</p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          ${buildProductRows(opts.items)}
          <tr>
            <td style="padding:16px 0 0;border-top:2px solid ${C.amber};">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:11px;color:${C.gray400};">Totale pagato (IVA incl.)</td>
                  <td align="right" style="font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:20px;font-weight:800;color:${C.burgundy};">€ ${opts.amount}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>` : ""}

    <!-- ━━━ TIMELINE ━━━ -->
    <tr>
      <td style="padding:26px 40px 32px;border-bottom:1px solid #f0ebe8;background:#fdfaf8;">
        <p style="margin:0 0 20px;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:9px;color:${C.gray400};text-transform:uppercase;letter-spacing:0.2em;">Stato della tua spedizione</p>
        ${buildEmailTimeline(opts.activeStep, opts.createdAt)}
      </td>
    </tr>

    <!-- ━━━ CTA ━━━ -->
    <tr>
      <td style="padding:36px 40px;text-align:center;border-bottom:1px solid #f0ebe8;">
        <a href="${opts.trackingUrl}" target="_blank"
           style="display:inline-block;background-color:${C.green};color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;padding:16px 44px;border-radius:4px;letter-spacing:0.03em;"
        >${opts.ctaLabel}</a>
        <br><br>
        <span style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#bbb;">oppure accedi direttamente:</span><br>
        <a href="${opts.trackingUrl}" target="_blank"
           style="font-family:Arial,Helvetica,sans-serif;font-size:10px;color:${C.green};text-decoration:underline;word-break:break-all;"
        >${opts.trackingUrl}</a>
      </td>
    </tr>

    <!-- ━━━ FOOTER ━━━ -->
    <tr>
      <td style="padding:0;">
        <!-- Gold divider -->
        <div style="height:3px;background:linear-gradient(90deg,${C.amber},#d4880a,${C.amber});"></div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${C.burgundy};">
          <tr>
            <td align="center" style="padding:20px 40px 22px;">
              <img src="${LOGO_URL}" alt="Panini" width="90" style="max-width:90px;height:auto;display:block;margin:0 auto 12px;opacity:0.75;border:0;" />
              <p style="margin:0 0 6px;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:9px;color:rgba(255,255,255,0.5);letter-spacing:0.2em;text-transform:uppercase;">Panini Italia Srl · Assistenza Clienti</p>
              <p style="margin:0 0 6px;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:10px;color:rgba(255,255,255,0.4);line-height:1.6;">Reso gratuito entro 30 giorni · Spedizione gratuita in tutta Italia</p>
              <p style="margin:0;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:9px;color:rgba(255,255,255,0.3);">© ${year} Panini Italia Srl · Tutti i diritti riservati · Licenziatario ufficiale FIFA</p>
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

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Individual email builders
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export function emailDay0(data: EmailData): { subject: string; html: string } {
  return {
    subject: `✓ Ordine ${data.orderId} confermato — Panini Italia`,
    html: shell({
      badgeLabel: "Conferma dell'ordine",
      headline: `Il tuo ordine è confermato`,
      preheader: `Ordine ${data.orderId} confermato. Grazie per il tuo acquisto su Panini Italia.`,
      trackingUrl: data.trackingUrl,
      orderId: data.orderId,
      ctaLabel: "Segui il mio ordine in tempo reale",
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      amount: data.amount,
      items: data.items,
      createdAt: data.createdAt,
      activeStep: 0,
    }),
  };
}

export function emailDay1(data: EmailData): { subject: string; html: string } {
  return {
    subject: `📦 Il tuo ordine ${data.orderId} è in viaggio — Panini Italia`,
    html: shell({
      badgeLabel: "Ordine in viaggio",
      headline: `Il tuo ordine è in transito`,
      preheader: `Il tuo ordine ${data.orderId} ha lasciato il nostro magazzino ed è diretto a ${data.city}.`,
      trackingUrl: data.trackingUrl,
      orderId: data.orderId,
      ctaLabel: "Vedi lo stato della spedizione",
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      amount: data.amount,
      items: data.items,
      createdAt: data.createdAt,
      activeStep: 1,
      bodyExtra: `<table role="presentation" cellspacing="0" cellpadding="0" style="background:#fdf8f6;border-left:3px solid ${C.amber};width:100%;border-radius:0 4px 4px 0;">
        <tr><td style="padding:14px 18px;">
          <p style="margin:0 0 4px;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:9px;color:#aaa;text-transform:uppercase;letter-spacing:0.15em;">Consegna stimata</p>
          <p style="margin:0;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:13px;font-weight:700;color:${C.burgundy};">Nei prossimi 2–3 giorni lavorativi · ${data.city}</p>
        </td></tr>
      </table>`,
    }),
  };
}

export function emailDay2(data: EmailData): { subject: string; html: string } {
  return {
    subject: `🏭 Ordine ${data.orderId} arrivato al centro di distribuzione`,
    html: shell({
      badgeLabel: "Centro di distribuzione",
      headline: `Il tuo ordine è quasi arrivato`,
      preheader: `Il tuo ordine ${data.orderId} è arrivato al centro di distribuzione. Consegna domani.`,
      trackingUrl: data.trackingUrl,
      orderId: data.orderId,
      ctaLabel: "Vedi lo stato della spedizione",
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      amount: data.amount,
      items: data.items,
      createdAt: data.createdAt,
      activeStep: 2,
      bodyExtra: `<table role="presentation" cellspacing="0" cellpadding="0" style="background:#fdf8f6;border-left:3px solid ${C.amber};width:100%;border-radius:0 4px 4px 0;">
        <tr><td style="padding:14px 18px;">
          <p style="margin:0 0 4px;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:9px;color:#aaa;text-transform:uppercase;letter-spacing:0.15em;">Prossimo passo</p>
          <p style="margin:0;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:13px;font-weight:700;color:${C.burgundy};">Domani inizierà la consegna nella tua zona · ${data.city}</p>
        </td></tr>
      </table>`,
    }),
  };
}

export function emailDay3(data: EmailData): { subject: string; html: string } {
  return {
    subject: `🚚 Il tuo ordine ${data.orderId} è in consegna OGGI`,
    html: shell({
      badgeLabel: "In consegna oggi",
      headline: `Il tuo ordine arriva oggi`,
      preheader: `Il corriere è in viaggio con il tuo ordine ${data.orderId}. Preparati a riceverlo!`,
      trackingUrl: data.trackingUrl,
      orderId: data.orderId,
      ctaLabel: "Segui la consegna in diretta",
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      amount: data.amount,
      items: data.items,
      createdAt: data.createdAt,
      activeStep: 3,
      bodyExtra: `<table role="presentation" cellspacing="0" cellpadding="0" style="background:${C.burgundy};width:100%;border-radius:4px;">
        <tr><td style="padding:16px 24px;text-align:center;">
          <p style="margin:0 0 4px;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:9px;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:0.2em;">Stato attuale</p>
          <p style="margin:0;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:16px;font-weight:800;color:#ffffff;letter-spacing:0.06em;">IN CONSEGNA · ${data.city.toUpperCase()}</p>
        </td></tr>
      </table>
      <p style="margin:12px 0 0;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:11px;color:#888;line-height:1.6;text-align:center;">Se non sei disponibile, il corriere lascerà un avviso per concordare una nuova consegna.</p>`,
    }),
  };
}

export function emailDay5(data: EmailData): { subject: string; html: string } {
  return {
    subject: `⚠️ Avviso importante sul tuo ordine ${data.orderId}`,
    html: shell({
      badgeLabel: "Avviso di ritardo",
      headline: `Aggiornamento sul tuo ordine`,
      preheader: `Il tuo ordine ${data.orderId} presenta un piccolo ritardo. Ci scusiamo per l'inconveniente.`,
      trackingUrl: data.trackingUrl,
      orderId: data.orderId,
      ctaLabel: "Vedi lo stato attuale dell'ordine",
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      amount: data.amount,
      items: data.items,
      createdAt: data.createdAt,
      activeStep: 4,
      bodyExtra: `
      <table role="presentation" cellspacing="0" cellpadding="0" style="background:#fff8f3;border:1px solid #f5d5c0;width:100%;border-radius:4px;margin-bottom:14px;">
        <tr><td style="padding:16px 20px;">
          <p style="margin:0 0 6px;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:10px;color:${C.burgundy};text-transform:uppercase;letter-spacing:0.15em;font-weight:700;">⚠ Avviso ritardo · ${data.city}</p>
          <p style="margin:0;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:12px;color:#444;line-height:1.6;">Il tuo ordine <strong>${data.orderId}</strong> sta subendo un piccolo ritardo. Prevediamo la consegna nelle prossime 24–48 ore. Ci scusiamo per gli inconvenienti.</p>
        </td></tr>
      </table>
      <table role="presentation" cellspacing="0" cellpadding="0" style="background:#fdf8f6;border-left:3px solid ${C.green};width:100%;border-radius:0 4px 4px 0;">
        <tr><td style="padding:14px 18px;">
          <p style="margin:0 0 4px;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:9px;color:#aaa;text-transform:uppercase;letter-spacing:0.15em;">Come scuse</p>
          <p style="margin:0;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:13px;font-weight:700;color:${C.green};">10% di sconto sul prossimo acquisto — Codice: <span style="font-family:'Courier New',monospace;background:#edf7f0;padding:2px 6px;border-radius:3px;color:${C.burgundy};">PANINI10</span></p>
        </td></tr>
      </table>`,
    }),
  };
}

export function emailDay6(data: EmailData): { subject: string; html: string } {
  return {
    subject: `🔍 Stiamo localizzando il tuo ordine ${data.orderId} — Panini Italia`,
    html: shell({
      badgeLabel: "Localizzazione in corso",
      headline: `Stiamo cercando il tuo ordine`,
      preheader: `Abbiamo perso temporaneamente il segnale del tuo ordine ${data.orderId}. Il nostro team sta lavorando per risolvere.`,
      trackingUrl: data.trackingUrl,
      orderId: data.orderId,
      ctaLabel: "Vedi lo stato della localizzazione",
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      amount: data.amount,
      items: data.items,
      createdAt: data.createdAt,
      activeStep: 5,
      bodyExtra: `
      <table role="presentation" cellspacing="0" cellpadding="0" style="background:#f5f8ff;border:1px solid #c8d8f0;width:100%;border-radius:4px;margin-bottom:14px;">
        <tr><td style="padding:16px 20px;">
          <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:10px;color:#3a5fa0;text-transform:uppercase;letter-spacing:0.15em;font-weight:700;">🔍 Segnale di tracciamento interrotto</p>
          <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#444;line-height:1.6;">Il nostro sistema ha perso temporaneamente il segnale del tuo pacco. Questo accade durante i trasferimenti tra hub logistici. Prevediamo il recupero nelle prossime <strong>2–4 ore</strong>.</p>
        </td></tr>
      </table>
      <table role="presentation" cellspacing="0" cellpadding="0" style="background:#fdf8f6;border-left:3px solid ${C.amber};width:100%;border-radius:0 4px 4px 0;">
        <tr><td style="padding:14px 18px;">
          <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:9px;color:#aaa;text-transform:uppercase;letter-spacing:0.15em;">Non è necessaria alcuna azione</p>
          <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:${C.burgundy};">Il tuo pacco è in transito e sarà localizzato a breve. Ti avviseremo con le prossime novità.</p>
        </td></tr>
      </table>`,
    }),
  };
}

export function emailDay7(data: EmailData): { subject: string; html: string } {
  return {
    subject: `📦 Il tuo pacco è in controllo doganale — Ordine ${data.orderId}`,
    html: shell({
      badgeLabel: "Controllo doganale",
      headline: `Il tuo ordine è in revisione doganale`,
      preheader: `Il tuo ordine ${data.orderId} è in controllo doganale. Risoluzione prevista in 24–48 ore.`,
      trackingUrl: data.trackingUrl,
      orderId: data.orderId,
      ctaLabel: "Consulta lo stato doganale",
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      amount: data.amount,
      items: data.items,
      createdAt: data.createdAt,
      activeStep: 6,
      bodyExtra: `
      <table role="presentation" cellspacing="0" cellpadding="0" style="background:#fdf8f6;border-left:3px solid ${C.amber};width:100%;border-radius:0 4px 4px 0;margin-bottom:14px;">
        <tr><td style="padding:14px 18px;">
          <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:9px;color:#aaa;text-transform:uppercase;letter-spacing:0.15em;">Riferimento doganale</p>
          <p style="margin:0;font-family:'Courier New',monospace;font-size:15px;font-weight:700;color:${C.burgundy};letter-spacing:0.1em;">IT-DOG-${data.orderId}-7</p>
        </td></tr>
      </table>
      <table role="presentation" cellspacing="0" cellpadding="0" style="background:#fffbf0;border:1px solid #e8d88a;width:100%;border-radius:4px;">
        <tr><td style="padding:16px 20px;">
          <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:10px;color:#8a6d00;text-transform:uppercase;letter-spacing:0.15em;font-weight:700;">📋 Procedura standard — Nessun costo aggiuntivo</p>
          <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#444;line-height:1.6;">Il controllo doganale è una verifica standard. Il tuo ordine <strong>non è bloccato</strong> e non richiede pagamenti aggiuntivi. Risoluzione entro <strong>24–48 ore</strong>.</p>
        </td></tr>
      </table>`,
    }),
  };
}

export function emailDay8(data: EmailData): { subject: string; html: string } {
  return {
    subject: `⚠️ Conferma il tuo indirizzo per ricevere l'ordine ${data.orderId}`,
    html: shell({
      badgeLabel: "Verifica dell'indirizzo",
      headline: `Dobbiamo confermare il tuo indirizzo`,
      preheader: `Azione richiesta: conferma l'indirizzo di consegna per l'ordine ${data.orderId} entro 24 ore.`,
      trackingUrl: data.trackingUrl,
      orderId: data.orderId,
      ctaLabel: "Conferma il mio indirizzo",
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      amount: data.amount,
      items: data.items,
      createdAt: data.createdAt,
      activeStep: 7,
      bodyExtra: `
      <table role="presentation" cellspacing="0" cellpadding="0" style="background:#fff8f3;border:1px solid #f5d5c0;width:100%;border-radius:4px;">
        <tr><td style="padding:16px 20px;">
          <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:10px;color:${C.burgundy};text-transform:uppercase;letter-spacing:0.15em;font-weight:700;">⚠ Azione richiesta entro 24 ore</p>
          <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#444;line-height:1.6;">Il corriere non ha potuto verificare l'indirizzo di consegna per l'ordine <strong>${data.orderId}</strong>. Clicca il pulsante qui sotto per confermare i dati e programmare la consegna.</p>
        </td></tr>
      </table>`,
    }),
  };
}

export function emailDay9(data: EmailData): { subject: string; html: string } {
  return {
    subject: `✅ Buone notizie — Il tuo ordine ${data.orderId} è stato rilanciato`,
    html: shell({
      badgeLabel: "Ordine rilanciato",
      headline: `Il tuo ordine è di nuovo in movimento`,
      preheader: `Buone notizie! Il tuo ordine ${data.orderId} ha ripreso il percorso di consegna.`,
      trackingUrl: data.trackingUrl,
      orderId: data.orderId,
      ctaLabel: "Segui il nuovo percorso",
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      amount: data.amount,
      items: data.items,
      createdAt: data.createdAt,
      activeStep: 8,
      bodyExtra: `<table role="presentation" cellspacing="0" cellpadding="0" style="background:#f0fff4;border:1px solid #a8d5b5;width:100%;border-radius:4px;">
        <tr><td style="padding:16px 20px;">
          <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:10px;color:${C.green};text-transform:uppercase;letter-spacing:0.15em;font-weight:700;">✅ Ordine rilanciato con successo</p>
          <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#444;line-height:1.6;">Il tuo ordine <strong>${data.orderId}</strong> ha superato tutti i controlli ed è tornato in transito verso <strong>${data.city}</strong>. Prevediamo la consegna nelle prossime 24–48 ore.</p>
        </td></tr>
      </table>`,
    }),
  };
}

export function emailDay10(data: EmailData): { subject: string; html: string } {
  return {
    subject: `🎉 Il tuo ordine ${data.orderId} arriverà presto!`,
    html: shell({
      badgeLabel: "Consegna imminente",
      headline: `La consegna è imminente`,
      preheader: `Il tuo ordine ${data.orderId} sta per arrivare. Il corriere è in zona.`,
      trackingUrl: data.trackingUrl,
      orderId: data.orderId,
      ctaLabel: "Segui la consegna finale",
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      amount: data.amount,
      items: data.items,
      createdAt: data.createdAt,
      activeStep: 9,
      bodyExtra: `<table role="presentation" cellspacing="0" cellpadding="0" style="background:${C.burgundy};width:100%;border-radius:4px;">
        <tr><td style="padding:16px 24px;text-align:center;">
          <p style="margin:0 0 4px;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:9px;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:0.2em;">Stato attuale</p>
          <p style="margin:0;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:16px;font-weight:800;color:#ffffff;letter-spacing:0.06em;">CONSEGNA IMMINENTE · ${data.city.toUpperCase()}</p>
        </td></tr>
      </table>`,
    }),
  };
}

export function emailDayNonConsegnato(data: EmailData): { subject: string; html: string } {
  return {
    subject: `📋 Aggiornamento consegna — Ordine ${data.orderId}`,
    html: shell({
      badgeLabel: "Tentativo di consegna",
      headline: `Non eravamo presenti oggi`,
      preheader: `Il corriere ha tentato di consegnare il tuo ordine ${data.orderId} ma non ha trovato nessuno.`,
      trackingUrl: data.trackingUrl,
      orderId: data.orderId,
      ctaLabel: "Programma una nuova consegna",
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      amount: data.amount,
      items: data.items,
      createdAt: data.createdAt,
      activeStep: 9,
      bodyExtra: `
      <table role="presentation" cellspacing="0" cellpadding="0" style="background:#fff8f3;border:1px solid #f5d5c0;width:100%;border-radius:4px;">
        <tr><td style="padding:16px 20px;">
          <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:10px;color:${C.burgundy};text-transform:uppercase;letter-spacing:0.15em;font-weight:700;">Tentativo di consegna non riuscito</p>
          <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#444;line-height:1.6;">Il corriere ha tentato di consegnare l'ordine <strong>${data.orderId}</strong> ma non ha trovato nessuno. Clicca qui sotto per programmare un nuovo tentativo di consegna.</p>
        </td></tr>
      </table>`,
    }),
  };
}

export function emailDayDiNuovoInRotta(data: EmailData): { subject: string; html: string } {
  return {
    subject: `🔄 Il tuo ordine ${data.orderId} è di nuovo in rotta`,
    html: shell({
      badgeLabel: "Di nuovo in rotta",
      headline: `Nuovo tentativo di consegna programmato`,
      preheader: `Il tuo ordine ${data.orderId} è stato rimesso in rotta. Nuovo tentativo a breve.`,
      trackingUrl: data.trackingUrl,
      orderId: data.orderId,
      ctaLabel: "Vedi lo stato aggiornato",
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      amount: data.amount,
      items: data.items,
      createdAt: data.createdAt,
      activeStep: 9,
      bodyExtra: `<table role="presentation" cellspacing="0" cellpadding="0" style="background:#f0fff4;border:1px solid #a8d5b5;width:100%;border-radius:4px;">
        <tr><td style="padding:16px 20px;">
          <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:10px;color:${C.green};text-transform:uppercase;letter-spacing:0.15em;font-weight:700;">🔄 Nuovo tentativo programmato</p>
          <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#444;line-height:1.6;">Il tuo ordine <strong>${data.orderId}</strong> è stato rimesso in rotta. Un corriere si presenterà di nuovo nelle prossime <strong>24 ore</strong>. Assicurati di essere disponibile.</p>
        </td></tr>
      </table>`,
    }),
  };
}
