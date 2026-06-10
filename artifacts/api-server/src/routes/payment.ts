import { Router, type IRouter, type Request, type Response } from "express";
import Stripe from "stripe";

const router: IRouter = Router();

function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY not configured");
  return new Stripe(secretKey, { apiVersion: "2026-04-22.dahlia" });
}

router.post("/payment/create-intent", async (req: Request, res: Response) => {
  try {
    const stripe = getStripe();
    const { amount, currency, payer, kitName } = req.body as {
      amount: number;
      currency?: string;
      payer: { email: string; name: string; document: string; phone: string };
      kitName?: string;
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

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: resolvedCurrency,
      automatic_payment_methods: { enabled: true },
      description: kitName ? `Panini FIFA WC26 Kit \u2014 ${kitName}` : "Panini FIFA World Cup 2026 Kit",
      metadata: {
        customer_email: payer.email,
        customer_name: payer.name,
        customer_phone: payer.phone,
        customer_document: payer.document,
        kit: kitName ?? "",
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
