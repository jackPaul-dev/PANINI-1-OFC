import { Router } from "express";
import { Resend } from "resend";
import {
  createOrder,
  getOrder,
  getOrderByPaymentIntent,
  upsertOrderById,
  listOrders,
  addEmailRecord,
  type Order,
} from "../lib/orderStore.js";
import {
  emailDay0, emailDay1, emailDay2, emailDay3, emailDay5,
  emailDay6, emailDay7, emailDay8, emailDay9, emailDay10,
  emailDayNonConsegnato, emailDayDiNuovoInRotta,
  type EmailData,
} from "../lib/emailTemplates.js";

const router = Router();

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY not configured");
  return new Resend(key);
}

const FROM          = process.env.EMAIL_FROM || "Panini USA <noreply@paniniworldcup2026.site>";
const TRACKING_BASE = (process.env.TRACKING_BASE_URL || "https://paniniworldcup2026.site").replace(/\/$/, "");

/* Embed all order data in the tracking URL so the page works even after a server restart */
function buildTrackingUrl(
  base: string,
  orderId: string,
  step: number,
  data: { name: string; city: string; amount: number; items: string[]; createdAt: string }
): string {
  const p = new URLSearchParams({
    orderId,
    step    : String(step),
    name    : data.name,
    city    : data.city,
    amount  : String(data.amount),
    items   : Buffer.from(JSON.stringify(data.items)).toString("base64"),
    date    : data.createdAt,
  });
  return `${base}/seguimiento?${p.toString()}`;
}

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

/* Step index matching each EMAIL_DAYS entry — controls timeline position in tracking URL */
const EMAIL_STEPS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9];

async function sendEmailSequence(order: Order) {
  const resend = getResend();
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
    const step        = EMAIL_STEPS[i] ?? 9;
    const trackingUrl = buildTrackingUrl(TRACKING_BASE, order.orderId, step, {
      name    : order.customerName,
      city    : order.city,
      amount  : order.amount,
      items   : order.items,
      createdAt: order.createdAt,
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
      const result = await resend.emails.send(payload as unknown as Parameters<Resend["emails"]["send"]>[0]);
      resendId = result.data?.id ?? null;
      status   = scheduledAt ? "scheduled" : "sent";
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`Failed to send day ${day} email:`, msg);
      status = "failed";
    }

    await addEmailRecord(order.orderId, {
      day,
      subject,
      resendId,
      status,
      scheduledAt: scheduledAt ?? null,
      sentAt: new Date().toISOString(),
    });
  }
}

/* ── POST /api/emails/trigger — called by frontend after successful Stripe payment ── */
router.post("/emails/trigger", async (req, res) => {
  try {
    const {
      paymentIntentId, customerEmail, customerName,
      address, city, postalCode, province, country,
      amount, items,
    } = req.body as {
      paymentIntentId: string; customerEmail: string; customerName: string;
      address: string; city: string; postalCode: string; province: string;
      country: string; amount: number; items: string[];
    };

    if (!customerEmail || !paymentIntentId) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const existing = await getOrderByPaymentIntent(paymentIntentId);
    if (existing) {
      res.json({ orderId: existing.orderId, message: "Already triggered" });
      return;
    }

    const order = await createOrder({
      paymentIntentId, customerEmail, customerName,
      address   : address    ?? "",
      city      : city       ?? "",
      postalCode: postalCode ?? "",
      province  : province   ?? "",
      country   : country    || "IT",
      amount,
      items     : items ?? [],
    });

    sendEmailSequence(order).catch(console.error);

    res.json({ orderId: order.orderId, emailsScheduled: EMAIL_DAYS.length, message: "Sequenza email avviata" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: msg });
  }
});

/* ── GET /api/emails/orders ── */
router.get("/emails/orders", async (_req, res) => {
  try {
    const orders = await listOrders();
    res.json(orders);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: msg });
  }
});

/* ── GET /api/orders/:orderId — used by the tracking page ── */
router.get("/orders/:orderId", async (req, res) => {
  try {
    const order = await getOrder(req.params.orderId.toUpperCase());
    if (!order) { res.status(404).json({ error: "Order not found" }); return; }
    res.json({
      orderId     : order.orderId,
      customerName: order.customerName,
      city        : order.city,
      createdAt   : order.createdAt,
      amount      : order.amount,
      items       : order.items,
      emails      : order.emails,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: msg });
  }
});

/* ── POST /api/emails/test — sends template variants (optional: only=[0,1,...]) ── */
router.post("/emails/test", async (req, res) => {
  try {
    const { email, only } = req.body as { email: string; only?: number[] };
    if (!email) { res.status(400).json({ error: "Missing email" }); return; }

    const resend      = getResend();
    const now         = new Date().toISOString();
    const testOrderId = "PAN-DEMO7X";
    const testItems   = [
      "1x Champion Kit — 1 Album + 2 Boxes (60 sticker packs)",
      "+100 sticker packs · ~500 stickers",
    ];

    /* Persist test order in DB with known ID so the tracking link always resolves */
    await upsertOrderById({
      orderId        : testOrderId,
      paymentIntentId: "pi_test_demo",
      customerEmail  : email,
      customerName   : "John Mitchell",
      address        : "123 Main Street",
      city           : "New York",
      postalCode     : "10001",
      province       : "NY",
      country        : "US",
      amount         : 94.99,
      items          : testItems,
      createdAt      : now,
    });

    const testBase = TRACKING_BASE;

    const baseTestData = {
      customerName : "John Mitchell",
      customerEmail: email,
      orderId      : testOrderId,
      amount       : "94.99",
      items        : testItems,
      city         : "New York",
      createdAt    : now,
    };

    const builders = [
      { fn: emailDay0,              label: "Day 0 — Order Confirmed",        step: 0 },
      { fn: emailDay1,              label: "Day 1 — Order Shipped",          step: 1 },
      { fn: emailDay2,              label: "Day 2 — Distribution Center",    step: 2 },
      { fn: emailDay3,              label: "Day 3 — Out for Delivery",       step: 3 },
      { fn: emailDay5,              label: "Day 5 — First Delivery Attempt", step: 4 },
      { fn: emailDay6,              label: "Day 6 — Locating Package",       step: 5 },
      { fn: emailDay7,              label: "Day 7 — Customs Review",         step: 6 },
      { fn: emailDay8,              label: "Day 8 — Address Verification",   step: 7 },
      { fn: emailDay9,              label: "Day 9 — Order Relaunched",       step: 8 },
      { fn: emailDay10,             label: "Day 10 — Delivery Imminent",     step: 9 },
      { fn: emailDayNonConsegnato,  label: "Day 11 — Failed Delivery",       step: 9 },
      { fn: emailDayDiNuovoInRotta, label: "Day 12 — Back on Route",         step: 9 },
    ];

    const toSend = only ? builders.filter((_, i) => only.includes(i)) : builders;
    const results: { day: string; id: string | null; status: string }[] = [];
    for (const { fn, label, step } of toSend) {
      const testData: EmailData = {
        ...baseTestData,
        trackingUrl: buildTrackingUrl(testBase, testOrderId, step, {
          name     : "John Mitchell",
          city     : "New York",
          amount   : 94.99,
          items    : testItems,
          createdAt: now,
        }),
      };
      const { subject, html } = fn(testData);
      try {
        const result = await resend.emails.send({ from: FROM, to: email, subject, html });
        results.push({ day: label, id: result.data?.id ?? null, status: "sent" });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        results.push({ day: label, id: null, status: `failed: ${msg}` });
      }
      await new Promise((r) => setTimeout(r, 300));
    }

    res.json({ ok: true, sent: results.length, results });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: msg });
  }
});

/* ── GET /api/emails/trigger (idempotency check) ── */
router.get("/emails/trigger", async (_req, res) => {
  res.json({ status: "ok", message: "Use POST /api/emails/trigger to start the sequence" });
});

export default router;
