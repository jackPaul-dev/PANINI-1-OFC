import { Router } from "express";
import { Resend } from "resend";
import {
  createOrder,
  getOrder,
  getOrderByPaymentIntent,
  listOrders,
  addEmailRecord,
  upsertOrder,
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

const FROM = process.env.EMAIL_FROM || "Panini Italia <onboarding@resend.dev>";
const TRACKING_BASE = (process.env.TRACKING_BASE_URL || "https://panini-it.herokuapp.com").replace(/\/$/, "");

const EMAIL_DAYS = [
  { day: 0,  offsetHours: 0 },
  { day: 1,  offsetHours: 24 },
  { day: 2,  offsetHours: 48 },
  { day: 3,  offsetHours: 72 },
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

async function sendEmailSequence(order: Order) {
  const resend = getResend();
  const trackingUrl = `${TRACKING_BASE}/?orderId=${order.orderId}`;
  const data: EmailData = {
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    orderId: order.orderId,
    trackingUrl,
    amount: order.amount.toFixed(2).replace(".", ","),
    items: order.items,
    city: order.city,
    createdAt: order.createdAt,
  };

  for (let i = 0; i < EMAIL_DAYS.length; i++) {
    const { day, offsetHours } = EMAIL_DAYS[i];
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`Failed to send day ${day} email:`, msg);
      status = "failed";
    }

    addEmailRecord(order.orderId, {
      day,
      subject,
      resendId,
      status,
      scheduledAt: scheduledAt ?? null,
      sentAt: new Date().toISOString(),
    });
  }
}

/* POST /api/emails/trigger — called by frontend after successful payment */
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

    const existing = getOrderByPaymentIntent(paymentIntentId);
    if (existing) {
      res.json({ orderId: existing.orderId, message: "Already triggered" });
      return;
    }

    const order = createOrder({
      paymentIntentId, customerEmail, customerName,
      address, city, postalCode, province,
      country: country || "IT", amount, items,
    });

    sendEmailSequence(order).catch(console.error);

    res.json({ orderId: order.orderId, message: "Sequenza email avviata" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: msg });
  }
});

/* GET /api/emails/orders */
router.get("/emails/orders", (_req, res) => {
  res.json(listOrders());
});

/* GET /api/orders/:orderId */
router.get("/orders/:orderId", (req, res) => {
  const order = getOrder(req.params.orderId);
  if (!order) { res.status(404).json({ error: "Order not found" }); return; }
  res.json({
    orderId: order.orderId,
    customerName: order.customerName,
    city: order.city,
    createdAt: order.createdAt,
    amount: order.amount,
    items: order.items,
    emails: order.emails,
  });
});

/* POST /api/emails/test — sends all emails immediately to a test address */
router.post("/emails/test", async (req, res) => {
  try {
    const { email } = req.body as { email: string };
    if (!email) { res.status(400).json({ error: "Missing email" }); return; }

    const resend = getResend();
    const now = new Date().toISOString();
    const testOrderId = "PAN-DEMO7X";
    const testItems = [
      "1x Kit Campione — 1 Album + 2 Box (60 bustine)",
      "+100 bustine · ~500 figurine",
    ];

    upsertOrder({
      orderId: testOrderId,
      paymentIntentId: "pi_test",
      customerEmail: email,
      customerName: "Marco Rossi",
      address: "Via Roma 1",
      city: "Milano",
      postalCode: "20121",
      province: "MI",
      country: "IT",
      amount: 94.99,
      items: testItems,
      createdAt: now,
      emails: [],
    });

    const testData: EmailData = {
      customerName: "Marco Rossi",
      customerEmail: email,
      orderId: testOrderId,
      trackingUrl: `${TRACKING_BASE}/?orderId=${testOrderId}`,
      amount: "94,99",
      items: testItems,
      city: "Milano",
      createdAt: now,
    };

    const builders = [
      { fn: emailDay0,             label: "Giorno 0 — Conferma" },
      { fn: emailDay1,             label: "Giorno 1 — In viaggio" },
      { fn: emailDay2,             label: "Giorno 2 — Centro distribuzione" },
      { fn: emailDay3,             label: "Giorno 3 — In consegna oggi" },
      { fn: emailDay5,             label: "Giorno 5 — Ritardo" },
      { fn: emailDay6,             label: "Giorno 6 — Localizzazione" },
      { fn: emailDay7,             label: "Giorno 7 — Controllo doganale" },
      { fn: emailDay8,             label: "Giorno 8 — Verifica indirizzo" },
      { fn: emailDay9,             label: "Giorno 9 — Rilanciato" },
      { fn: emailDay10,            label: "Giorno 10 — Imminente" },
      { fn: emailDayNonConsegnato, label: "Giorno 11 — Non consegnato" },
      { fn: emailDayDiNuovoInRotta, label: "Giorno 12 — Di nuovo in rotta" },
    ];

    const results: { day: string; id: string | null; status: string }[] = [];
    for (const { fn, label } of builders) {
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

export default router;
