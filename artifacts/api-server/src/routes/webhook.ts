import { Router, type Request, type Response } from "express";
import Stripe from "stripe";
import { createOrder, getOrderByPaymentIntent } from "../lib/orderStore.js";
import { capiPurchase } from "../lib/metaCapi.js";
import {
  emailDay0, emailDay1, emailDay2, emailDay3, emailDay5,
  emailDay6, emailDay7, emailDay8, emailDay9, emailDay10,
  emailDayNonConsegnato, emailDayDiNuovoInRotta,
  type EmailData,
} from "../lib/emailTemplates.js";
import { Resend } from "resend";
import { addEmailRecord } from "../lib/orderStore.js";

const router = Router();

const FROM          = process.env.EMAIL_FROM || "Panini USA <noreply@paniniworldcup2026.site>";
const TRACKING_BASE = (process.env.TRACKING_BASE_URL || "https://paniniworldcup2026.site").replace(/\/$/, "");

const EMAIL_DAYS = [
  { day: 0,  offsetHours: 0   },
  { day: 1,  offsetHours: 24  },
  { day: 2,  offsetHours: 48  },
  { day: 3,  offsetHours: 72  },
  { day: 5,  offsetHours: 120 },
  { day: 6,  offsetHours: 144 },
  { day: 7,  offsetHours: 168 },
  { day: 8,  offsetHours: 192 },
  { day: 9,  offsetHours: 216 },
  { day: 10, offsetHours: 240 },
  { day: 11, offsetHours: 264 },
  { day: 12, offsetHours: 288 },
  { day: 13, offsetHours: 312 },
  { day: 14, offsetHours: 336 },
  { day: 15, offsetHours: 360 },
  { day: 16, offsetHours: 384 },
  { day: 17, offsetHours: 408 },
  { day: 18, offsetHours: 432 },
  { day: 19, offsetHours: 456 },
  { day: 20, offsetHours: 480 },
];

const BUILDERS = [
  emailDay0, emailDay1, emailDay2, emailDay3, emailDay5,
  emailDay6, emailDay7, emailDay8, emailDay9, emailDay10,
  emailDayNonConsegnato, emailDayDiNuovoInRotta,
  emailDayNonConsegnato, emailDayDiNuovoInRotta,
  emailDayNonConsegnato, emailDayDiNuovoInRotta,
  emailDayNonConsegnato, emailDayDiNuovoInRotta,
  emailDayNonConsegnato, emailDayDiNuovoInRotta,
];

const EMAIL_STEPS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9];

function buildTrackingUrl(
  orderId: string, step: number,
  d: { name: string; city: string; amount: number; items: string[]; createdAt: string },
  currency?: string
): string {
  const p = new URLSearchParams({
    orderId, step: String(step),
    name: d.name, city: d.city, amount: String(d.amount),
    items: Buffer.from(JSON.stringify(d.items)).toString("base64"),
    date: d.createdAt,
  });
  const trackingPath = (currency ?? "usd").toLowerCase() === "eur"
    ? "/france/suivre"
    : "/seguimiento";
  return `${TRACKING_BASE}${trackingPath}?${p.toString()}`;
}

function kitFromAmount(amount: number): string[] {
  if (amount <= 15)  return ["Starter Kit — 1 Album + 10 sticker packs"];
  if (amount <= 30)  return ["Fan Kit — 1 Album + 1 Box (30 sticker packs)"];
  if (amount <= 45)  return ["Champion Kit — 1 Album + 2 Boxes (60 sticker packs)"];
  if (amount <= 65)  return ["Collector Kit — 1 Album + 3 Boxes (90 sticker packs)"];
  if (amount <= 105) return ["Gold Cover Kit — 1 Album + 6 Boxes (180 sticker packs)"];
  return ["Stadium Exclusive Kit — 1 Album + 250 sticker packs"];
}

/* ── UTMify Direct API ────────────────────────────────────────────────────
 * Notifica a UTMify diretamente via API credentials (sem depender do
 * webhook Stripe→UTMify, que apresentava falhas de atribuição).
 * Endpoint: POST https://api.utmify.com.br/api-credentials/orders
 * Auth: X-Api-Token header
 */
async function notifyUtmify(
  order: Awaited<ReturnType<typeof createOrder>>,
  pi: Stripe.PaymentIntent,
  meta: Record<string, string>
): Promise<void> {
  const apiToken = process.env.UTMIFY_API_TOKEN;
  if (!apiToken) {
    console.error("UTMify: UTMIFY_API_TOKEN não configurado — skip");
    return;
  }

  // Slugify do nome do kit para usar como ID do produto
  const kitRaw   = meta.kit || order.items[0] || "kit";
  const kitSlug  = kitRaw.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const kitName  = kitRaw;

  // Calcula xcod server-side (caso frontend não tenha capturado via UTMify script)
  const SEP = "hQwK21wXxR";
  let xcod = meta.xcod || meta.sck || "";
  if (!xcod) {
    const src = meta.utm_source ?? "";
    const cmp = meta.utm_campaign ?? "";
    const med = meta.utm_medium ?? "";
    const cnt = meta.utm_content ?? "";
    const trm = meta.utm_term ?? "";
    if (src || cmp || med) {
      const raw = [src, cmp, med, cnt, trm].join(SEP);
      xcod = raw.length > 255 ? raw.slice(0, 255) : raw;
    }
  }

  const totalCents  = pi.amount; // Stripe já armazena em centavos
  const currency    = (pi.currency ?? "eur").toUpperCase(); // ex: "EUR"
  const nowIso      = new Date().toISOString();
  const createdIso  = new Date(pi.created * 1000).toISOString();

  const payload = {
    orderId:       order.orderId,
    platform:      "other",
    paymentMethod: "credit_card",
    status:        "paid",
    createdAt:     createdIso,
    approvedDate:  nowIso,
    refundedAt:    null,
    customer: {
      name:     order.customerName  || null,
      email:    order.customerEmail || null,
      phone:    meta.customer_phone || null,
      document: meta.customer_document || null,
      country:  order.country || "FR",
      city:     order.city    || null,
      state:    order.province || null,
      zipCode:  order.postalCode || null,
    },
    commission: {
      totalPriceInCents:     totalCents,
      gatewayFeeInCents:     0,
      userCommissionInCents: totalCents,
      currency,               // "EUR" — sem isso UTMify assume BRL e converte errado
    },
    trackingParameters: {
      utm_source:   meta.utm_source   || null,
      utm_campaign: meta.utm_campaign || null,
      utm_medium:   meta.utm_medium   || null,
      utm_content:  meta.utm_content  || null,
      utm_term:     meta.utm_term     || null,
      src:          meta.utm_source   || null,
      sck:          xcod              || null,
      xcod:         xcod              || null,
    },
    products: [{
      id:          kitSlug,
      name:        kitName,
      planId:      kitSlug,
      planName:    kitName,
      quantity:    1,
      priceInCents: totalCents,
    }],
  };

  try {
    const resp = await fetch("https://api.utmify.com.br/api-credentials/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Token": apiToken,
      },
      body: JSON.stringify(payload),
    });
    const body = await resp.json() as { OK?: boolean; result?: string; message?: string };
    if (body.OK) {
      console.log(`UTMify: pedido ${order.orderId} registrado com sucesso`);
    } else {
      console.error("UTMify API erro:", JSON.stringify(body));
    }
  } catch (err) {
    console.error("UTMify API fetch error:", err);
  }
}

async function sendEmailSequence(order: Awaited<ReturnType<typeof createOrder>>, currency = "usd") {
  const resend = new Resend(process.env.RESEND_API_KEY!);
  const baseData = {
    customerName : order.customerName,
    customerEmail: order.customerEmail,
    orderId      : order.orderId,
    amount       : order.amount.toFixed(2).replace(".", ","),
    items        : order.items,
    city         : order.city,
    createdAt    : order.createdAt,
  };

  for (let i = 0; i < EMAIL_DAYS.length; i++) {
    const { day, offsetHours } = EMAIL_DAYS[i];
    const step = EMAIL_STEPS[i] ?? 9;
    const trackingUrl = buildTrackingUrl(order.orderId, step, {
      name: order.customerName, city: order.city,
      amount: order.amount, items: order.items, createdAt: order.createdAt,
    }, currency);
    const data: EmailData = { ...baseData, trackingUrl };
    const { subject, html } = BUILDERS[i](data);
    const scheduledAt = offsetHours > 0
      ? new Date(Date.now() + offsetHours * 3600 * 1000).toISOString()
      : undefined;

    let resendId: string | null = null;
    let status: "sent" | "scheduled" | "failed" = "sent";
    try {
      const payload: Record<string, unknown> = { from: FROM, to: order.customerEmail, subject, html };
      if (scheduledAt) payload.scheduledAt = scheduledAt;
      const result = await resend.emails.send(payload as unknown as Parameters<Resend["emails"]["send"]>[0]);
      resendId = result.data?.id ?? null;
      status = scheduledAt ? "scheduled" : "sent";
    } catch (err) {
      status = "failed";
      console.error(`Webhook email day ${day} failed:`, err);
    }
    await addEmailRecord(order.orderId, { day, subject, resendId, status, scheduledAt: scheduledAt ?? null, sentAt: new Date().toISOString() });
  }
}

/* ── POST /api/webhooks/stripe ── */
router.post(
  "/webhooks/stripe",
  (req: Request, res: Response) => {
    const sig     = req.headers["stripe-signature"] as string;
    const secret  = process.env.STRIPE_WEBHOOK_SECRET;
    const stripe  = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-04-22.dahlia" });

    let event: Stripe.Event;
    try {
      if (secret) {
        event = stripe.webhooks.constructEvent(req.body as Buffer, sig, secret);
      } else {
        event = JSON.parse((req.body as Buffer).toString()) as Stripe.Event;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(400).send(`Webhook Error: ${msg}`);
      return;
    }

    if (event.type === "payment_intent.succeeded") {
      const pi      = event.data.object as Stripe.PaymentIntent;
      const meta    = pi.metadata ?? {};
      const charge  = (pi as unknown as { latest_charge?: Stripe.Charge })?.latest_charge;
      const billing = (charge?.billing_details ?? {}) as { email?: string | null; name?: string | null; address?: { city?: string | null; line1?: string | null; line2?: string | null; postal_code?: string | null; state?: string | null; country?: string | null } | null };

      const customerEmail = meta.customerEmail ?? meta.customer_email ?? charge?.receipt_email ?? billing.email ?? "";
      const customerName  = meta.customerName  ?? meta.customer_name  ?? billing.name ?? "";
      const city          = meta.city ?? (billing.address?.city ?? "");
      const amount        = pi.amount / 100;

      let items: string[] = [];
      try { items = meta.items ? JSON.parse(meta.items) : kitFromAmount(amount); } catch { items = kitFromAmount(amount); }

      if (!customerEmail) {
        res.json({ received: true, skipped: "no email" });
        return;
      }

      // Fire and forget — respond to Stripe immediately
      getOrderByPaymentIntent(pi.id).then(existing => {
        if (existing) {
          // Pedido já criado pelo frontend — notifica UTMify de qualquer forma
          return notifyUtmify(existing, pi, meta as Record<string, string>);
        }
        return createOrder({
          paymentIntentId: pi.id,
          customerEmail, customerName,
          address: [billing.address?.line1, billing.address?.line2].filter(Boolean).join(" "),
          city, postalCode: billing.address?.postal_code ?? "",
          province: billing.address?.state ?? "",
          country: billing.address?.country ?? "FR",
          amount, items,
        }).then(order => {
          const isEur = (pi.currency ?? "usd").toLowerCase() === "eur";
          const capiSourceUrl = isEur
            ? `${TRACKING_BASE}/france/checkout`
            : `https://paniniworldcup2026.site/checkout`;
          capiPurchase({
            eventId: pi.id,
            email: customerEmail,
            name: customerName,
            amount,
            currency: pi.currency ?? "usd",
            contentIds: items,
            clientIp: (req.headers["x-forwarded-for"] as string ?? req.socket.remoteAddress ?? "").split(",")[0].trim(),
            userAgent: req.headers["user-agent"] ?? "",
            sourceUrl: capiSourceUrl,
          });
          // Notifica UTMify via API direta
          notifyUtmify(order, pi, meta as Record<string, string>);
          return sendEmailSequence(order, pi.currency ?? "usd");
        });
      }).catch(err => console.error("Webhook processing error:", err));
    }

    res.json({ received: true });
  }
);

export default router;
