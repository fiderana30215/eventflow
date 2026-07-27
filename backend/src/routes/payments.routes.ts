import { Router } from "express";
import Stripe from "stripe";
import { pool } from "../config/db";
import { authenticate, AuthRequest } from "../middleware/auth";
import { emitTicketsUpdate } from "../config/socket";

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// Créer une session de paiement Stripe pour une catégorie de billet
router.post("/checkout", authenticate, async (req: AuthRequest, res) => {
  const { category_id } = req.body;
  if (!category_id) return res.status(400).json({ error: "category_id manquant" });

  try {
    const category = await pool.query(
      `SELECT tc.*, e.title AS event_title
       FROM ticket_categories tc
       JOIN events e ON e.id = tc.event_id
       WHERE tc.id = $1`,
      [category_id]
    );
    if (category.rows.length === 0) return res.status(404).json({ error: "Catégorie introuvable" });
    const cat = category.rows[0];

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: `${cat.event_title} — ${cat.name}` },
            unit_amount: Math.round(Number(cat.price) * 100),
          },
          quantity: 1,
        },
      ],
      metadata: { category_id: String(category_id), user_id: String(req.user!.id) },
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Webhook Stripe — confirme le paiement et déclenche l'achat du billet
// NOTE: cette route doit recevoir le body brut (raw), configuré dans index.ts
router.post("/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err) {
    console.error("Webhook signature invalide", err);
    return res.status(400).send(`Webhook Error`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { category_id, user_id } = session.metadata as { category_id: string; user_id: string };

    // Enregistre le paiement — la création du billet réutilise la logique de tickets.routes.ts
    // Ici on insère directement pour rester simple dans le webhook
    try {
      const ticket = await pool.query(
        `INSERT INTO tickets (category_id, user_id, qr_code, status)
         VALUES ($1, $2, gen_random_uuid()::text, 'valid') RETURNING id`,
        [category_id, user_id]
      );
      const updatedCat = await pool.query(
        `UPDATE ticket_categories SET quantity_sold = quantity_sold + 1
         WHERE id = $1 RETURNING event_id, quantity_sold, quantity_total`,
        [category_id]
      );
      await pool.query(
        `INSERT INTO payments (ticket_id, stripe_payment_id, amount, status)
         VALUES ($1, $2, $3, 'succeeded')`,
        [ticket.rows[0].id, session.id, (session.amount_total || 0) / 100]
      );

      const { event_id, quantity_sold, quantity_total } = updatedCat.rows[0];
      emitTicketsUpdate(event_id, Number(category_id), quantity_sold, quantity_total);
    } catch (err) {
      console.error("Erreur traitement webhook", err);
    }
  }

  res.json({ received: true });
});

export default router;