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

const STEPS = [
  { label: "Order Confirmed",         sub: "Order successfully processed"       },
  { label: "Order Shipped",           sub: "Departed from warehouse"            },
  { label: "Distribution Center",    sub: "Arrived at logistics hub"           },
  { label: "Out for Delivery",        sub: "Courier is in your area"            },
  { label: "First Delivery Attempt",  sub: "Minor delay in progress"           },
  { label: "Locating Package",        sub: "Signal being recovered"             },
  { label: "Customs Review",          sub: "Standard inspection in progress"    },
  { label: "Address Verification",   sub: "Awaiting delivery confirmation"     },
  { label: "Order Relaunched",        sub: "New delivery route assigned"        },
  { label: "Delivery Imminent",       sub: "Courier arriving shortly"           },
];
const OFFSETS = [0, 1, 2, 3, 5, 6, 7, 8, 9, 10];

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
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
      ? `<span style="color:${C.green};font-size:10px;">&#10003; Completed &mdash; ${fmtDate(stepDate)}</span>`
      : active
      ? `<span style="color:${C.burgundy};font-size:10px;font-weight:600;">&#9654; In progress &mdash; ${step.sub}</span>`
      : `<span style="color:#c4c9d1;font-size:10px;">Expected: ${fmtDate(stepDate)}</span>`;

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
  const safeUrl = opts.trackingUrl.replace(/&/g, "&amp;");
  const F = "font-family:Arial,Helvetica,sans-serif;";

  return `<!DOCTYPE html>
<html lang="en">
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

  <!-- HEADER -->
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

  <!-- ORDER CODE -->
  <tr>
    <td style="background:${C.warm50};padding:16px 32px;text-align:center;border-bottom:3px solid ${C.amber};">
      <p style="margin:0 0 2px;${F}font-size:9px;color:${C.gray400};text-transform:uppercase;letter-spacing:0.22em;">Order Code</p>
      <p style="margin:0;font-family:'Courier New',monospace;font-size:28px;font-weight:700;color:${C.burgundy};letter-spacing:0.14em;">${opts.orderId}</p>
      <p style="margin:6px 0 0;${F}font-size:10px;color:${C.gray400};">${orderDate} &middot; ${opts.customerEmail}</p>
    </td>
  </tr>

  <!-- GREETING -->
  <tr>
    <td style="background:#ffffff;padding:22px 32px 18px;border-bottom:1px solid #f0ebe6;">
      <h2 style="margin:0 0 10px;font-family:Georgia,serif;font-size:22px;font-weight:400;color:${C.burgundy};line-height:1.3;">${opts.headline}</h2>
      <p style="margin:0;${F}font-size:13px;color:#4b5563;line-height:1.7;">
        Hi <strong style="color:${C.burgundy};">${firstName}</strong>, your order is confirmed and being processed.
      </p>
      ${opts.bodyExtra ? `<div style="margin-top:14px;">${opts.bodyExtra}</div>` : ""}
    </td>
  </tr>

  <!-- PRODUCTS -->
  ${opts.items.length > 0 ? `<tr>
    <td style="background:#ffffff;padding:16px 32px 18px;border-bottom:1px solid #f0ebe6;">
      <p style="margin:0 0 10px;${F}font-size:9px;font-weight:700;color:${C.gray400};text-transform:uppercase;letter-spacing:0.2em;">Order Items</p>
      ${opts.items.map(item => `<p style="margin:0 0 6px;${F}font-size:12px;color:#374151;line-height:1.5;padding-left:12px;border-left:3px solid ${C.amber};">${item}</p>`).join("")}
      <p style="margin:12px 0 0;padding-top:10px;border-top:1px solid #f0ebe6;${F}font-size:11px;color:${C.gray400};">Total paid (taxes incl.) &nbsp;<strong style="font-size:20px;color:${C.burgundy};">$&nbsp;${opts.amount}</strong></p>
    </td>
  </tr>` : ""}

  <!-- TIMELINE -->
  <tr>
    <td style="background:${C.offWhite};padding:20px 32px 22px;border-bottom:1px solid #e8e2dc;">
      <p style="margin:0 0 16px;${F}font-size:9px;font-weight:700;color:${C.gray400};text-transform:uppercase;letter-spacing:0.2em;">Shipment Status</p>
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

  <!-- FOOTER -->
  <tr>
    <td style="background:#fdf8f2;padding:16px 32px 20px;text-align:center;">
      <div style="height:2px;background:linear-gradient(90deg,${C.amber},${C.yellow},${C.amber});margin-bottom:14px;"></div>
      <p style="margin:0 0 4px;${F}font-size:9px;color:#b0a898;letter-spacing:0.18em;text-transform:uppercase;">Panini USA LLC &middot; Customer Support</p>
      <p style="margin:0 0 4px;${F}font-size:10px;color:#c0b8af;">Free returns within 30 days &middot; Free shipping across the USA</p>
      <p style="margin:0;${F}font-size:9px;color:#d0c8c0;">&copy; ${year} Panini USA LLC &middot; Official FIFA World Cup 2026 Licensee</p>
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
    subject: `✓ Order ${data.orderId} confirmed — Panini USA`,
    html: shell({
      badgeLabel   : "Order Confirmation",
      headline     : `Your order is confirmed`,
      preheader    : `Order ${data.orderId} confirmed. Thank you for your purchase on Panini USA.`,
      trackingUrl  : data.trackingUrl,
      orderId      : data.orderId,
      ctaLabel     : "Track my order in real time",
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
    subject: `📦 Your order ${data.orderId} is on its way — Panini USA`,
    html: shell({
      badgeLabel   : "Order Shipped",
      headline     : `Your order is in transit`,
      preheader    : `Your order ${data.orderId} has left the warehouse and is heading to ${data.city}.`,
      trackingUrl  : data.trackingUrl,
      orderId      : data.orderId,
      ctaLabel     : "View shipment status",
      customerName : data.customerName,
      customerEmail: data.customerEmail,
      amount       : data.amount,
      items        : data.items,
      createdAt    : data.createdAt,
      activeStep   : 1,
      bodyExtra    : `<table role="presentation" cellspacing="0" cellpadding="0"
          style="background:#fdf8f2;border-left:3px solid #f5a623;width:100%;border-radius:0 4px 4px 0;">
          <tr><td style="padding:14px 18px;">
            <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.15em;">Estimated Delivery</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#6b0f1a;">In the next 2–3 business days &middot; ${data.city}</p>
          </td></tr>
        </table>`,
    }),
  };
}

export function emailDay2(data: EmailData): { subject: string; html: string } {
  return {
    subject: `🏭 Order ${data.orderId} arrived at distribution center`,
    html: shell({
      badgeLabel   : "Distribution Center",
      headline     : `Your order is almost there`,
      preheader    : `Your order ${data.orderId} is at the distribution center. Delivery tomorrow.`,
      trackingUrl  : data.trackingUrl,
      orderId      : data.orderId,
      ctaLabel     : "View shipment status",
      customerName : data.customerName,
      customerEmail: data.customerEmail,
      amount       : data.amount,
      items        : data.items,
      createdAt    : data.createdAt,
      activeStep   : 2,
      bodyExtra    : `<table role="presentation" cellspacing="0" cellpadding="0"
          style="background:#fdf8f2;border-left:3px solid #f5a623;width:100%;border-radius:0 4px 4px 0;">
          <tr><td style="padding:14px 18px;">
            <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.15em;">Next Step</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#6b0f1a;">Tomorrow delivery begins in your area &middot; ${data.city}</p>
          </td></tr>
        </table>`,
    }),
  };
}

export function emailDay3(data: EmailData): { subject: string; html: string } {
  return {
    subject: `🚚 Your order ${data.orderId} is out for delivery TODAY`,
    html: shell({
      badgeLabel   : "Out for Delivery Today",
      headline     : `Your order arrives today`,
      preheader    : `The courier is on the way with your order ${data.orderId}. Get ready to receive it!`,
      trackingUrl  : data.trackingUrl,
      orderId      : data.orderId,
      ctaLabel     : "Track live delivery",
      customerName : data.customerName,
      customerEmail: data.customerEmail,
      amount       : data.amount,
      items        : data.items,
      createdAt    : data.createdAt,
      activeStep   : 3,
      bodyExtra    : `<table role="presentation" cellspacing="0" cellpadding="0"
          style="background:#6b0f1a;width:100%;border-radius:4px;">
          <tr><td style="padding:16px 24px;text-align:center;">
            <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:9px;color:rgba(255,255,255,0.55);text-transform:uppercase;letter-spacing:0.22em;">Current Status</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:15px;font-weight:800;color:#ffffff;letter-spacing:0.06em;">OUT FOR DELIVERY · ${data.city.toUpperCase()}</p>
          </td></tr>
        </table>
        <p style="margin:10px 0 0;font-family:Arial,sans-serif;font-size:11px;color:#9ca3af;line-height:1.6;text-align:center;">If you're not available, the courier will leave a notice to schedule a new delivery attempt.</p>`,
    }),
  };
}

export function emailDay5(data: EmailData): { subject: string; html: string } {
  return {
    subject: `⚠️ Important update on your order ${data.orderId}`,
    html: shell({
      badgeLabel   : "Delay Notice",
      headline     : `Update on your order`,
      preheader    : `Your order ${data.orderId} has a minor delay. We apologize for the inconvenience.`,
      trackingUrl  : data.trackingUrl,
      orderId      : data.orderId,
      ctaLabel     : "View current order status",
      customerName : data.customerName,
      customerEmail: data.customerEmail,
      amount       : data.amount,
      items        : data.items,
      createdAt    : data.createdAt,
      activeStep   : 4,
      bodyExtra    : `<table role="presentation" cellspacing="0" cellpadding="0"
          style="background:#fff8f3;border:1px solid #fad0b8;width:100%;border-radius:4px;margin-bottom:12px;">
          <tr><td style="padding:16px 20px;">
            <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:10px;color:#6b0f1a;text-transform:uppercase;letter-spacing:0.15em;font-weight:700;">&#9888; Delay &middot; ${data.city}</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#4b5563;line-height:1.65;">Your order <strong>${data.orderId}</strong> has a minor delay. We expect delivery in the next 24–48 hours. We sincerely apologize for the inconvenience.</p>
          </td></tr>
        </table>
        <table role="presentation" cellspacing="0" cellpadding="0"
          style="background:#f0fff6;border-left:3px solid #16a34a;width:100%;border-radius:0 4px 4px 0;">
          <tr><td style="padding:14px 18px;">
            <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.15em;">As our apology</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#16a34a;">10% off your next order &mdash; Code: <span style="font-family:'Courier New',monospace;background:#e8f5ed;padding:2px 6px;border-radius:3px;color:#6b0f1a;">PANINI10</span></p>
          </td></tr>
        </table>`,
    }),
  };
}

export function emailDay6(data: EmailData): { subject: string; html: string } {
  return {
    subject: `🔍 We're locating your order ${data.orderId} — Panini USA`,
    html: shell({
      badgeLabel   : "Locating Package",
      headline     : `We're searching for your order`,
      preheader    : `We lost the tracking signal for order ${data.orderId}. Our team is working to resolve this.`,
      trackingUrl  : data.trackingUrl,
      orderId      : data.orderId,
      ctaLabel     : "View location status",
      customerName : data.customerName,
      customerEmail: data.customerEmail,
      amount       : data.amount,
      items        : data.items,
      createdAt    : data.createdAt,
      activeStep   : 5,
      bodyExtra    : `<table role="presentation" cellspacing="0" cellpadding="0"
          style="background:#f0f5ff;border:1px solid #c7d7f5;width:100%;border-radius:4px;margin-bottom:12px;">
          <tr><td style="padding:16px 20px;">
            <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:10px;color:#3a5fa0;text-transform:uppercase;letter-spacing:0.15em;font-weight:700;">&#128269; Tracking signal interrupted</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#4b5563;line-height:1.65;">The system temporarily lost the parcel's signal during hub transfer. We expect recovery within the next <strong>2–4 hours</strong>.</p>
          </td></tr>
        </table>
        <table role="presentation" cellspacing="0" cellpadding="0"
          style="background:#fdf8f2;border-left:3px solid #f5a623;width:100%;border-radius:0 4px 4px 0;">
          <tr><td style="padding:14px 18px;">
            <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.15em;">No action required</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#6b0f1a;">Your package is in transit and will be located shortly.</p>
          </td></tr>
        </table>`,
    }),
  };
}

export function emailDay7(data: EmailData): { subject: string; html: string } {
  return {
    subject: `📦 Your package is under customs review — Order ${data.orderId}`,
    html: shell({
      badgeLabel   : "Customs Review",
      headline     : `Your order is under customs review`,
      preheader    : `Your order ${data.orderId} is in customs review. Resolution within 24–48 hours.`,
      trackingUrl  : data.trackingUrl,
      orderId      : data.orderId,
      ctaLabel     : "Check customs status",
      customerName : data.customerName,
      customerEmail: data.customerEmail,
      amount       : data.amount,
      items        : data.items,
      createdAt    : data.createdAt,
      activeStep   : 6,
      bodyExtra    : `<table role="presentation" cellspacing="0" cellpadding="0"
          style="background:#fdf8f2;border-left:3px solid #f5a623;width:100%;border-radius:0 4px 4px 0;margin-bottom:12px;">
          <tr><td style="padding:14px 18px;">
            <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:9px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.15em;">Customs Reference</p>
            <p style="margin:0;font-family:'Courier New',monospace;font-size:15px;font-weight:700;color:#6b0f1a;letter-spacing:0.1em;">US-CUS-${data.orderId}-7</p>
          </td></tr>
        </table>
        <table role="presentation" cellspacing="0" cellpadding="0"
          style="background:#fffbee;border:1px solid #e8d88a;width:100%;border-radius:4px;">
          <tr><td style="padding:16px 20px;">
            <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:10px;color:#8a6d00;text-transform:uppercase;letter-spacing:0.15em;font-weight:700;">&#128203; Standard procedure &mdash; No additional charges</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#4b5563;line-height:1.65;">Customs review is a standard verification. Your order is not blocked and requires no additional payments. Resolution within <strong>24–48 hours</strong>.</p>
          </td></tr>
        </table>`,
    }),
  };
}

export function emailDay8(data: EmailData): { subject: string; html: string } {
  return {
    subject: `⚠️ Confirm your address to receive order ${data.orderId}`,
    html: shell({
      badgeLabel   : "Address Verification",
      headline     : `We need to confirm your address`,
      preheader    : `Action required: confirm delivery address for order ${data.orderId} within 24 hours.`,
      trackingUrl  : data.trackingUrl,
      orderId      : data.orderId,
      ctaLabel     : "Confirm my address",
      customerName : data.customerName,
      customerEmail: data.customerEmail,
      amount       : data.amount,
      items        : data.items,
      createdAt    : data.createdAt,
      activeStep   : 7,
      bodyExtra    : `<table role="presentation" cellspacing="0" cellpadding="0"
          style="background:#fff8f3;border:1px solid #fad0b8;width:100%;border-radius:4px;">
          <tr><td style="padding:16px 20px;">
            <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:10px;color:#6b0f1a;text-transform:uppercase;letter-spacing:0.15em;font-weight:700;">&#9888; Action required within 24 hours</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#4b5563;line-height:1.65;">The courier couldn't verify the delivery address for order <strong>${data.orderId}</strong>. Click the button below to confirm your details and schedule delivery.</p>
          </td></tr>
        </table>`,
    }),
  };
}

export function emailDay9(data: EmailData): { subject: string; html: string } {
  return {
    subject: `✅ Good news — Your order ${data.orderId} has been relaunched`,
    html: shell({
      badgeLabel   : "Order Relaunched",
      headline     : `Your order is moving again`,
      preheader    : `Great news! Your order ${data.orderId} has resumed its delivery route.`,
      trackingUrl  : data.trackingUrl,
      orderId      : data.orderId,
      ctaLabel     : "Follow new route",
      customerName : data.customerName,
      customerEmail: data.customerEmail,
      amount       : data.amount,
      items        : data.items,
      createdAt    : data.createdAt,
      activeStep   : 8,
      bodyExtra    : `<table role="presentation" cellspacing="0" cellpadding="0"
          style="background:#f0fff6;border:1px solid #a8d5b5;width:100%;border-radius:4px;">
          <tr><td style="padding:16px 20px;">
            <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:10px;color:#16a34a;text-transform:uppercase;letter-spacing:0.15em;font-weight:700;">&#10003; Order successfully relaunched</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#4b5563;line-height:1.65;">Your order <strong>${data.orderId}</strong> has passed all checks and is back in transit to <strong>${data.city}</strong>. We expect delivery in the next 24–48 hours.</p>
          </td></tr>
        </table>`,
    }),
  };
}

export function emailDay10(data: EmailData): { subject: string; html: string } {
  return {
    subject: `🎉 Your order ${data.orderId} is arriving soon!`,
    html: shell({
      badgeLabel   : "Delivery Imminent",
      headline     : `Delivery is imminent`,
      preheader    : `Your order ${data.orderId} is almost there. The courier is in your area.`,
      trackingUrl  : data.trackingUrl,
      orderId      : data.orderId,
      ctaLabel     : "Track final delivery",
      customerName : data.customerName,
      customerEmail: data.customerEmail,
      amount       : data.amount,
      items        : data.items,
      createdAt    : data.createdAt,
      activeStep   : 9,
      bodyExtra    : `<table role="presentation" cellspacing="0" cellpadding="0"
          style="background:#6b0f1a;width:100%;border-radius:4px;">
          <tr><td style="padding:16px 24px;text-align:center;">
            <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:9px;color:rgba(255,255,255,0.55);text-transform:uppercase;letter-spacing:0.22em;">Current Status</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:15px;font-weight:800;color:#ffffff;letter-spacing:0.06em;">DELIVERY IMMINENT · ${data.city.toUpperCase()}</p>
          </td></tr>
        </table>`,
    }),
  };
}

export function emailDayNonConsegnato(data: EmailData): { subject: string; html: string } {
  return {
    subject: `📋 Delivery update — Order ${data.orderId}`,
    html: shell({
      badgeLabel   : "Delivery Attempt",
      headline     : `We weren't able to deliver today`,
      preheader    : `The courier attempted to deliver order ${data.orderId} but no one was available.`,
      trackingUrl  : data.trackingUrl,
      orderId      : data.orderId,
      ctaLabel     : "Schedule a new delivery",
      customerName : data.customerName,
      customerEmail: data.customerEmail,
      amount       : data.amount,
      items        : data.items,
      createdAt    : data.createdAt,
      activeStep   : 9,
      bodyExtra    : `<table role="presentation" cellspacing="0" cellpadding="0"
          style="background:#fff8f3;border:1px solid #fad0b8;width:100%;border-radius:4px;">
          <tr><td style="padding:16px 20px;">
            <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:10px;color:#6b0f1a;text-transform:uppercase;letter-spacing:0.15em;font-weight:700;">Failed delivery attempt</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#4b5563;line-height:1.65;">The courier attempted to deliver order <strong>${data.orderId}</strong> but no one was available. Click below to schedule a new attempt.</p>
          </td></tr>
        </table>`,
    }),
  };
}

export function emailDayDiNuovoInRotta(data: EmailData): { subject: string; html: string } {
  return {
    subject: `🔄 Your order ${data.orderId} is back on route`,
    html: shell({
      badgeLabel   : "Back on Route",
      headline     : `New delivery attempt scheduled`,
      preheader    : `Your order ${data.orderId} has been rerouted. New attempt coming soon.`,
      trackingUrl  : data.trackingUrl,
      orderId      : data.orderId,
      ctaLabel     : "View updated status",
      customerName : data.customerName,
      customerEmail: data.customerEmail,
      amount       : data.amount,
      items        : data.items,
      createdAt    : data.createdAt,
      activeStep   : 9,
      bodyExtra    : `<table role="presentation" cellspacing="0" cellpadding="0"
          style="background:#f0fff6;border:1px solid #a8d5b5;width:100%;border-radius:4px;">
          <tr><td style="padding:16px 20px;">
            <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:10px;color:#16a34a;text-transform:uppercase;letter-spacing:0.15em;font-weight:700;">&#128260; New attempt scheduled</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#4b5563;line-height:1.65;">Your order <strong>${data.orderId}</strong> has been rerouted. A courier will arrive in the next <strong>24 hours</strong>. Please make sure someone is available to receive it.</p>
          </td></tr>
        </table>`,
    }),
  };
}
