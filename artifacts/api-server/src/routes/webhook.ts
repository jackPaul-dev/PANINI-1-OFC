import { Router, type Request, type Response } from "express";
import Stripe from "stripe";
import { createOrder, getOrderByPaymentIntent } from "../lib/orderStore.js";
import {
  emailDay0, emailDay1, emailDay2, emailDay3, emailDay5,
  emailDay6, emailDay7, emailDay8, emailDay9, emailDay10,
  emailDayNonConsegnato, emailDayDiNuovoInRotta,
  type EmailData,
} from "../lib/emailTemplates.js";
import { Resend } from "resend";
import { addEmailRecord } from "../lib/orderStore.js";

const router = Router();

const FROM          = process.env.EMAIL_FROM || "Panini Italia <noreply@panini-worldcup.online>";
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
  d: { name: string; city: string; amount: number; items: string[]; createdAt: string }
): string {
  const p = new URLSearchParams({
    orderId, step: String(step),
    name: d.name, city: d.city, amount: String(d.amount),
    items: Buffer.from(JSON.stringify(d.items)).toString("base64"),
    date: d.createdAt,
  });
  return `${TRACKING_BASE}/seguimiento?${p.toString()}`;
}

function kitFromAmount(amount: number): string[] {
  if (amount <= 15)  return ["Kit Base — 1 Album + 10 bustine"];
  if (amount <= 30)  return ["Kit Principiante — 1 Album + 1 Box (30 bustine)"];
  if (amount <= 45)  return ["Kit Campione — 1 Album + 2 Box (60 bustine)"];
  if (amount <= 65)  return ["Kit Collezionista — 1 Album + 3 Box (90 bustine)"];
  if (amount <= 105) return ["Kit Album Copertina Dorata — 1 Album + 6 Box (180 bustine)"];
  return ["Kit Esclusivo Stadio — 1 Album + 250 bustine"];
}

async function sendEmailSequence(order: Awaited<ReturnType<typeof createOrder>>) {
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
    });
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
      const result = await resend.emails.send(payload as Parameters<Resend["emails"]["send"]>[0]);
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
  // raw body needed for Stripe signature verification
  (req: Request, res: Response) => {
    const sig     = req.headers["stripe-signature"] as string;
    const secret  = process.env.STRIPE_WEBHOOK_SECRET;
    const stripe  = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-04-30.basil" });

    let event: Stripe.Event;
    try {
      if (secret) {
        event = stripe.webhooks.constructEvent(req.body as Buffer, sig, secret);
      } else {
        // No secret yet — accept unsigned (dev/initial setup only)
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
      const billing = charge?.billing_details ?? {};

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
        if (existing) return; // already triggered by frontend
        return createOrder({
          paymentIntentId: pi.id,
          customerEmail, customerName,
          address: [billing.address?.line1, billing.address?.line2].filter(Boolean).join(" "),
          city, postalCode: billing.address?.postal_code ?? "",
          province: billing.address?.state ?? "",
          country: billing.address?.country ?? "IT",
          amount, items,
        }).then(order => sendEmailSequence(order));
      }).catch(err => console.error("Webhook processing error:", err));
    }

    res.json({ received: true });
  }
);

export default router;
