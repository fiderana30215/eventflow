import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { pool } from "../config/db";
import { authenticate, AuthRequest } from "../middleware/auth";
import { enqueueTicketEmail } from "../queues/email.queue";
import { emitTicketsUpdate } from "../config/socket";

const router = Router();

// Acheter un billet (après paiement confirmé côté Stripe — voir payments.routes.ts)
router.post("/purchase", authenticate, async (req: AuthRequest, res) => {
  const { category_id } = req.body;
  if (!category_id) return res.status(400).json({ error: "category_id manquant" });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const category = await client.query(
      "SELECT * FROM ticket_categories WHERE id = $1 FOR UPDATE",
      [category_id]
    );
    if (category.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Catégorie introuvable" });
    }
    const cat = category.rows[0];
    if (cat.quantity_sold >= cat.quantity_total) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "Plus de places disponibles" });
    }

    const qrCode = uuidv4();
    const ticket = await client.query(
      `INSERT INTO tickets (category_id, user_id, qr_code, status)
       VALUES ($1, $2, $3, 'valid') RETURNING *`,
      [category_id, req.user!.id, qrCode]
    );

    await client.query(
      "UPDATE ticket_categories SET quantity_sold = quantity_sold + 1 WHERE id = $1",
      [category_id]
    );

    await client.query("COMMIT");

    // Émet la mise à jour du compteur en temps réel à tous les visiteurs de cette page événement
    const eventInfo = await pool.query(
      "SELECT event_id FROM ticket_categories WHERE id = $1",
      [category_id]
    );
    emitTicketsUpdate(
      eventInfo.rows[0].event_id,
      Number(category_id),
      cat.quantity_sold + 1,
      cat.quantity_total
    );

    // Récupère infos user + event pour l'email
    const info = await pool.query(
      `SELECT u.email, u.full_name, e.title AS event_title
       FROM users u, events e, ticket_categories tc
       WHERE u.id = $1 AND tc.id = $2 AND e.id = tc.event_id`,
      [req.user!.id, category_id]
    );
    const { email, full_name, event_title } = info.rows[0];

    await enqueueTicketEmail({
      to: email,
      fullName: full_name,
      eventTitle: event_title,
      qrPayload: qrCode,
    });

    res.status(201).json(ticket.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  } finally {
    client.release();
  }
});

// Mes billets
router.get("/my", authenticate, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, e.title AS event_title, e.start_date, tc.name AS category_name
       FROM tickets t
       JOIN ticket_categories tc ON tc.id = t.category_id
       JOIN events e ON e.id = tc.event_id
       WHERE t.user_id = $1
       ORDER BY t.purchased_at DESC`,
      [req.user!.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;