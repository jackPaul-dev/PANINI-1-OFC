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
    const { amount, payer, kitName } = req.body as {
      amount: number;
      payer: { email: string; name: string; document: string; phone: string };
      kitName?: string;
    };

    if (!amount || !payer?.email) {
      res.status(400).json({ error: "Campi obbligatori mancanti: amount, payer" });
      return;
    }

    const amountCents = Math.round(amount * 100);
    if (amountCents < 50) {
      res.status(400).json({ error: "Importo minimo €0,50" });
      return;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "eur",
      automatic_payment_methods: { enabled: true },
      description: kitName ? `Kit Panini FIFA WC26 — ${kitName}` : "Kit Panini FIFA World Cup 2026",
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
      : "Errore interno del server";
    res.status(500).json({ error: message });
  }
});

export default router;
