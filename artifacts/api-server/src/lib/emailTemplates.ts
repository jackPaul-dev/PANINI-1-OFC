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
      ? `width:24px;height:24px;border-radius:50%;background:#111111;color:#ffffff;font-family:Arial,sans-serif;font-size:9px;font-weight:700;text-align:center;line-height:24px;`
      : active
      ? `width:20px;height:20px;border-radius:50%;background:#ffffff;color:#111111;font-family:Arial,sans-serif;font-size:9px;font-weight:700;text-align:center;line-height:20px;border:2px solid #111111;`
      : `width:24px;height:24px;border-radius:50%;background:#e0e0e0;color:#aaaaaa;font-family:Arial,sans-serif;font-size:9px;font-weight:700;text-align:center;line-height:24px;`;
    const dotText  = done ? "&#10003;" : String(i + 1);
    const lineBg   = done ? "#111111" : "#e5e5e5";
    const labelW   = done || active ? "600" : "400";
    const labelColor = done || active ? "#111111" : "#bbbbbb";
    const dateColor  = done ? "#555555" : active ? "#111111" : "#cccccc";
    const statusText = done ? `Completato`
                     : active ? `<strong style="color:#111111;">&#9654; In corso</strong>`
                     : `Previsto: ${fmtDate(stepDate)}`;

    rows += `
    <tr>
      <td width="28" valign="top">
        <table role="presentation" cellspacing="0" cellpadding="0" style="width:28px;">
          <tr><td align="center"><div style="${dotStyle}">${dotText}</div></td></tr>
          ${!isLast ? `<tr><td align="center" style="padding:1px 0;"><div style="width:1px;height:26px;background:${lineBg};margin:0 auto;"></div></td></tr>` : ""}
        </table>
      </td>
      <td style="padding:3px 0 ${isLast ? "0" : "24px"} 14px;">
        <p style="margin:0;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:11px;font-weight:${labelW};color:${labelColor};text-transform:uppercase;letter-spacing:0.1em;">${step.label}</p>
        <p style="margin:3px 0 0;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:10px;color:${dateColor};">${statusText}</p>
      </td>
    </tr>`;
  });
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0">${rows}</table>`;
}

function buildProductRows(items: string[]): string {
  return items.map(item => `
    <tr>
      <td style="padding:11px 0;border-bottom:1px solid #f0f0f0;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td width="6" valign="top" style="padding-top:4px;">
              <div style="width:4px;height:4px;background:#111;border-radius:50%;"></div>
            </td>
            <td style="padding-left:10px;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:12px;color:#222222;line-height:1.4;">${item}</td>
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
<body style="margin:0;padding:0;background:#efefef;-webkit-text-size-adjust:100%;">
<div style="display:none;font-size:1px;max-height:0;overflow:hidden;color:#efefef;">${opts.preheader}</div>

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#efefef">
<tr><td align="center" style="padding:36px 12px 48px;">
  <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e0e0e0;">

    <!-- HEADER -->
    <tr>
      <td style="background:#000000;padding:0;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding:22px 40px 16px;text-align:center;">
              <span style="font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:21px;font-weight:800;color:#ffffff;letter-spacing:0.3em;">PANINI</span>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 20px;text-align:center;border-bottom:1px solid #282828;">
              <span style="font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:9px;font-weight:600;color:#999999;letter-spacing:0.25em;text-transform:uppercase;">${opts.badgeLabel}</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- ORDER CODE HERO -->
    <tr>
      <td style="background:#111111;padding:28px 40px;text-align:center;border-bottom:3px solid #000;">
        <p style="margin:0 0 6px;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:9px;color:#777777;text-transform:uppercase;letter-spacing:0.22em;">Codice ordine</p>
        <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:26px;font-weight:700;color:#ffffff;letter-spacing:0.18em;">${opts.orderId}</p>
        <p style="margin:8px 0 0;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:10px;color:#555555;">${orderDate}</p>
      </td>
    </tr>

    <!-- GREETING -->
    <tr>
      <td style="padding:32px 40px 24px;border-bottom:1px solid #ebebeb;">
        <h1 style="margin:0 0 14px;font-family:'Times New Roman',Georgia,serif;font-size:26px;font-weight:400;color:#111111;line-height:1.2;">${opts.headline}</h1>
        <p style="margin:0 0 6px;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:13px;color:#444444;line-height:1.7;">
          Ciao <strong style="color:#111111;">${firstName}</strong>, ti confermiamo che il tuo ordine è stato ricevuto ed è in elaborazione.
        </p>
        ${opts.bodyExtra ? `<div style="margin-top:16px;">${opts.bodyExtra}</div>` : ""}
        <!-- Customer info -->
        <table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:20px;border:1px solid #e8e8e8;background:#fafafa;">
          <tr>
            <td style="padding:12px 20px;">
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:10px;color:#888888;text-transform:uppercase;letter-spacing:0.15em;padding-right:20px;">Cliente</td>
                  <td style="font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:11px;color:#111111;font-weight:600;">${opts.customerName}</td>
                </tr>
                <tr>
                  <td style="font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:10px;color:#888888;text-transform:uppercase;letter-spacing:0.15em;padding-right:20px;padding-top:4px;">Email</td>
                  <td style="font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:11px;color:#555555;padding-top:4px;">${opts.customerEmail}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- PRODUCTS -->
    ${opts.items.length > 0 ? `
    <tr>
      <td style="padding:28px 40px;border-bottom:1px solid #ebebeb;">
        <p style="margin:0 0 16px;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:9px;color:#999999;text-transform:uppercase;letter-spacing:0.2em;">Articoli dell'ordine</p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          ${buildProductRows(opts.items)}
          <tr>
            <td style="padding:16px 0 0;border-top:1px solid #e5e5e5;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:11px;color:#777777;">Totale pagato (IVA incl.)</td>
                  <td align="right" style="font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:17px;font-weight:700;color:#111111;">€ ${opts.amount}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>` : ""}

    <!-- TIMELINE -->
    <tr>
      <td style="padding:28px 40px 32px;border-bottom:1px solid #ebebeb;">
        <p style="margin:0 0 20px;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:9px;color:#999999;text-transform:uppercase;letter-spacing:0.2em;">Stato della tua spedizione</p>
        ${buildEmailTimeline(opts.activeStep, opts.createdAt)}
      </td>
    </tr>

    <!-- CTA -->
    <tr>
      <td style="padding:36px 40px;text-align:center;border-bottom:1px solid #ebebeb;">
        <a href="${opts.trackingUrl}" target="_blank" style="display:inline-block;background-color:#111111;color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;padding:16px 40px;border:2px solid #111111;cursor:pointer;">${opts.ctaLabel}</a>
        <br><br>
        <span style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#aaaaaa;">O accedi direttamente:</span><br>
        <a href="${opts.trackingUrl}" target="_blank" style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#555555;text-decoration:underline;word-break:break-all;">${opts.trackingUrl}</a>
      </td>
    </tr>

    <!-- FOOTER -->
    <tr>
      <td style="padding:28px 40px;text-align:center;background:#f9f9f9;">
        <p style="margin:0 0 8px;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:9px;color:#aaaaaa;letter-spacing:0.2em;text-transform:uppercase;">Panini Italia Srl · Assistenza Clienti</p>
        <p style="margin:0 0 8px;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:10px;color:#bbbbbb;line-height:1.6;">Reso gratuito entro 30 giorni · Spedizione standard gratuita in tutta Italia</p>
        <p style="margin:0;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:9px;color:#cccccc;">© ${year} Panini Italia Srl · Tutti i diritti riservati</p>
      </td>
    </tr>

  </table>
</td></tr>
</table>
</body>
</html>`;
}

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
      bodyExtra: `<table role="presentation" cellspacing="0" cellpadding="0" style="background:#f5f5f5;border-left:3px solid #111;width:100%;">
        <tr><td style="padding:14px 18px;">
          <p style="margin:0 0 4px;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:9px;color:#888888;text-transform:uppercase;letter-spacing:0.15em;">Consegna stimata</p>
          <p style="margin:0;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;color:#111111;">Nei prossimi 2–3 giorni lavorativi · ${data.city}</p>
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
      bodyExtra: `<table role="presentation" cellspacing="0" cellpadding="0" style="background:#f5f5f5;border-left:3px solid #111;width:100%;">
        <tr><td style="padding:14px 18px;">
          <p style="margin:0 0 4px;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:9px;color:#888888;text-transform:uppercase;letter-spacing:0.15em;">Prossimo passo</p>
          <p style="margin:0;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;color:#111111;">Domani inizierà la consegna nella tua zona · ${data.city}</p>
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
      bodyExtra: `<table role="presentation" cellspacing="0" cellpadding="0" style="background:#111111;width:100%;">
        <tr><td style="padding:16px 24px;text-align:center;">
          <p style="margin:0 0 6px;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:9px;color:#888888;text-transform:uppercase;letter-spacing:0.2em;">Stato attuale</p>
          <p style="margin:0;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;color:#ffffff;letter-spacing:0.08em;">IN CONSEGNA · ${data.city.toUpperCase()}</p>
        </td></tr>
      </table>
      <p style="margin:14px 0 0;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:11px;color:#888888;line-height:1.6;text-align:center;">Se non sei disponibile a ricevere il pacco, il corriere lascerà un avviso per concordare una nuova consegna.</p>`,
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
      <table role="presentation" cellspacing="0" cellpadding="0" style="background:#fff8f5;border:1px solid #f0d0c0;width:100%;margin-bottom:16px;">
        <tr><td style="padding:16px 20px;">
          <p style="margin:0 0 6px;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:10px;color:#c0533a;text-transform:uppercase;letter-spacing:0.15em;font-weight:700;">⚠ Avviso ritardo · ${data.city}</p>
          <p style="margin:0;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:12px;color:#444444;line-height:1.6;">Il tuo ordine <strong>${data.orderId}</strong> sta subendo un piccolo ritardo. Prevediamo la consegna nelle prossime 24–48 ore. Ci scusiamo per gli inconvenienti.</p>
        </td></tr>
      </table>
      <table role="presentation" cellspacing="0" cellpadding="0" style="background:#f5f5f5;border-left:3px solid #111;width:100%;">
        <tr><td style="padding:14px 18px;">
          <p style="margin:0 0 4px;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:9px;color:#888888;text-transform:uppercase;letter-spacing:0.15em;">Come scuse</p>
          <p style="margin:0;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;color:#111111;">10% di sconto sul prossimo acquisto — Codice: <span style="font-family:'Courier New',monospace;letter-spacing:0.1em;">PANINI10</span></p>
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
      <table role="presentation" cellspacing="0" cellpadding="0" style="background:#f5f8ff;border:1px solid #c8d8f0;width:100%;margin-bottom:16px;">
        <tr><td style="padding:16px 20px;">
          <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:10px;color:#3a5fa0;text-transform:uppercase;letter-spacing:0.15em;font-weight:700;">🔍 Segnale di tracciamento interrotto</p>
          <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#444444;line-height:1.6;">Il nostro sistema di tracciamento ha perso temporaneamente il segnale del tuo pacco. Questo accade durante i trasferimenti tra hub logistici. Stiamo lavorando per recuperare la localizzazione nelle prossime <strong>2–4 ore</strong>.</p>
        </td></tr>
      </table>
      <table role="presentation" cellspacing="0" cellpadding="0" style="background:#f5f5f5;border-left:3px solid #111;width:100%;">
        <tr><td style="padding:14px 18px;">
          <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:9px;color:#888888;text-transform:uppercase;letter-spacing:0.15em;">Non è necessaria alcuna azione</p>
          <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;font-weight:600;color:#111111;">Il tuo pacco è in transito e sarà localizzato a breve. Ti avviseremo non appena avremo novità.</p>
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
      preheader: `Il tuo ordine ${data.orderId} è stato rilevato in controllo doganale. Prevediamo risoluzione in 24–48 ore.`,
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
      <table role="presentation" cellspacing="0" cellpadding="0" style="background:#f5f5f5;border-left:3px solid #111;width:100%;margin-bottom:16px;">
        <tr><td style="padding:16px 20px;">
          <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:9px;color:#888888;text-transform:uppercase;letter-spacing:0.15em;">Riferimento doganale</p>
          <p style="margin:0;font-family:'Courier New',monospace;font-size:14px;font-weight:700;color:#111111;letter-spacing:0.12em;">IT-DOG-${data.orderId}-7</p>
        </td></tr>
      </table>
      <table role="presentation" cellspacing="0" cellpadding="0" style="background:#fffbf0;border:1px solid #e8d88a;width:100%;">
        <tr><td style="padding:16px 20px;">
          <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:10px;color:#8a6d00;text-transform:uppercase;letter-spacing:0.15em;font-weight:700;">📋 Procedura standard — Nessun costo aggiuntivo</p>
          <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#444444;line-height:1.6;">Il controllo doganale è una procedura standard di verifica. Il tuo ordine <strong>non è bloccato</strong> e non richiede alcun pagamento aggiuntivo. Prevediamo risoluzione entro <strong>24–48 ore</strong>.</p>
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
      <table role="presentation" cellspacing="0" cellpadding="0" style="background:#fff8f5;border:1px solid #f0d0c0;width:100%;margin-bottom:16px;">
        <tr><td style="padding:16px 20px;">
          <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:10px;color:#c0533a;text-transform:uppercase;letter-spacing:0.15em;font-weight:700;">⚠ Azione richiesta entro 24 ore</p>
          <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#444444;line-height:1.6;">Il corriere non ha potuto verificare l'indirizzo di consegna per il tuo ordine <strong>${data.orderId}</strong>. Clicca sul pulsante qui sotto per confermare i tuoi dati e programmare la consegna.</p>
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
      bodyExtra: `<table role="presentation" cellspacing="0" cellpadding="0" style="background:#f0fff4;border:1px solid #a8d5b5;width:100%;">
        <tr><td style="padding:16px 20px;">
          <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:10px;color:#2d6a4f;text-transform:uppercase;letter-spacing:0.15em;font-weight:700;">✅ Ordine rilanciato con successo</p>
          <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#444444;line-height:1.6;">Il tuo ordine <strong>${data.orderId}</strong> ha superato tutti i controlli ed è tornato in transito verso <strong>${data.city}</strong>. Prevediamo la consegna nelle prossime 24–48 ore.</p>
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
      bodyExtra: `<table role="presentation" cellspacing="0" cellpadding="0" style="background:#111111;width:100%;">
        <tr><td style="padding:16px 24px;text-align:center;">
          <p style="margin:0 0 6px;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:9px;color:#888888;text-transform:uppercase;letter-spacing:0.2em;">Stato attuale</p>
          <p style="margin:0;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;color:#ffffff;letter-spacing:0.08em;">CONSEGNA IMMINENTE · ${data.city.toUpperCase()}</p>
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
      <table role="presentation" cellspacing="0" cellpadding="0" style="background:#fff8f5;border:1px solid #f0d0c0;width:100%;margin-bottom:16px;">
        <tr><td style="padding:16px 20px;">
          <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:10px;color:#c0533a;text-transform:uppercase;letter-spacing:0.15em;font-weight:700;">Tentativo di consegna non riuscito</p>
          <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#444444;line-height:1.6;">Il corriere ha tentato di consegnare il tuo ordine <strong>${data.orderId}</strong> ma non ha trovato nessuno all'indirizzo indicato. Clicca qui sotto per programmare un nuovo tentativo.</p>
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
      preheader: `Il tuo ordine ${data.orderId} è stato rimesso in rotta. Un nuovo tentativo di consegna è previsto a breve.`,
      trackingUrl: data.trackingUrl,
      orderId: data.orderId,
      ctaLabel: "Vedi lo stato aggiornato",
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      amount: data.amount,
      items: data.items,
      createdAt: data.createdAt,
      activeStep: 9,
      bodyExtra: `<table role="presentation" cellspacing="0" cellpadding="0" style="background:#f0fff4;border:1px solid #a8d5b5;width:100%;">
        <tr><td style="padding:16px 20px;">
          <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:10px;color:#2d6a4f;text-transform:uppercase;letter-spacing:0.15em;font-weight:700;">🔄 Nuovo tentativo programmato</p>
          <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#444444;line-height:1.6;">Il tuo ordine <strong>${data.orderId}</strong> è stato rimesso in rotta. Un corriere si presenterà di nuovo all'indirizzo indicato nelle prossime 24 ore. Assicurati di essere disponibile.</p>
        </td></tr>
      </table>`,
    }),
  };
}
