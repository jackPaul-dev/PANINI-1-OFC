import { Router, type IRouter, type Request, type Response } from "express";
import Stripe from "stripe";

const router: IRouter = Router();

function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(secretKey, { apiVersion: "2026-04-22.dahlia" });
}

/* ── UTMify xcod/sck computation ──────────────────────────────────────────
 * UTMify uses xcod as the PRIMARY attribution key. The frontend computes it
 * via window.utmParams (set by UTMify's async script) but that races with
 * the PI creation. We compute it server-side from available UTM params using
 * UTMify's own formula: fields joined by the Hotmart separator.
 */
const UTMIFY_SEP = "hQwK21wXxR";

function computeXcod(p: Record<string, string>): string {
  const src      = p.utm_source   ?? "";
  const campaign = p.utm_campaign ?? "";
  const medium   = p.utm_medium   ?? "";
  const content  = p.utm_content  ?? "";
  const term     = p.utm_term     ?? "";
  if (!src && !campaign && !medium) return "";
  const parts = [src, campaign, medium, content, term];
  const xcod  = parts.join(UTMIFY_SEP);
  return xcod.length > 255 ? xcod.slice(0, 255) : xcod;
}

router.post("/payment/create-intent", async (req: Request, res: Response) => {
  try {
    const stripe = getStripe();
    const { amount, currency, payer, kitName, utmParams } = req.body as {
      amount: number;
      currency?: string;
      payer: { email: string; name: string; document: string; phone: string };
      kitName?: string;
      utmParams?: Record<string, string>;
    };

    if (!amount || !payer?.email) {
      res.status(400).json({ error: "Missing required fields: amount, payer" });
      return;
    }

    const amountCents = Math.round(amount * 100);
    if (amountCents < 50) {
      res.status(400).json({ error: "Minimum amount is 0.50" });
      return;
    }

    const resolvedCurrency = (currency ?? "eur").toLowerCase();

    // Compute xcod/sck server-side if frontend did not provide them
    // (UTMify script is async and may not have run before PI creation)
    let xcod = utmParams?.xcod ?? "";
    let sck  = utmParams?.sck  ?? "";
    if ((!xcod || !sck) && utmParams) {
      const computed = computeXcod(utmParams);
      if (computed) { xcod = computed; sck = computed; }
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: resolvedCurrency,
      automatic_payment_methods: { enabled: true },
      /* ── SCA / PSD2 (Europe) ──────────────────────────────────────────
       * French / EU cards require Strong Customer Authentication (3DS2).
       * "automatic" requests 3DS only when mandated by the bank or Radar
       * (covers virtually all EU card payments > €30 under PSD2).
       * Apple Pay / Google Pay are unaffected — they have their own auth.
       */
      payment_method_options: {
        card: { request_three_d_secure: "automatic" },
      },
      description: kitName ? `Panini FIFA WC26 Kit \u2014 ${kitName}` : "Panini FIFA World Cup 2026 Kit",
      metadata: {
        customer_email: payer.email,
        customer_name:  payer.name,
        customer_phone: payer.phone,
        customer_document: payer.document,
        kit: kitName ?? "",
        ...(utmParams ? {
          utm_source:     utmParams.utm_source   ?? "",
          utm_medium:     utmParams.utm_medium   ?? "",
          utm_campaign:   utmParams.utm_campaign ?? "",
          utm_content:    utmParams.utm_content  ?? "",
          utm_term:       utmParams.utm_term     ?? "",
          fbclid:         utmParams.fbclid       ?? "",
          ttclid:         utmParams.ttclid       ?? "",
          gclid:          utmParams.gclid        ?? "",
          utmify_lead_id: utmParams.utmify_lead_id ?? "",
          xcod,
          sck,
        } : {}),
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      transactionID: paymentIntent.id,
    });
  } catch (err) {
    req.log.error({ err }, "payment/create-intent error");
    const message = err instanceof Stripe.errors.StripeError
      ? err.message
      : "Internal server error";
    res.status(500).json({ error: message });
  }
});

router.post("/payment/update-intent", async (req: Request, res: Response) => {
  try {
    const stripe = getStripe();
    const { paymentIntentId, amount } = req.body as {
      paymentIntentId: string;
      amount: number;
    };

    if (!paymentIntentId || !amount) {
      res.status(400).json({ error: "Missing paymentIntentId or amount" });
      return;
    }

    const amountCents = Math.round(amount * 100);
    if (amountCents < 50) {
      res.status(400).json({ error: "Minimum amount is 0.50" });
      return;
    }

    await stripe.paymentIntents.update(paymentIntentId, { amount: amountCents });
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "payment/update-intent error");
    const message = err instanceof Stripe.errors.StripeError
      ? err.message
      : "Internal server error";
    res.status(500).json({ error: message });
  }
});

export default router;
