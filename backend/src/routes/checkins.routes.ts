import { Router } from "express";
import { pool } from "../config/db";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";

const router = Router();

// Scanner un billet (QR code) pour check-in
router.post("/", authenticate, authorize("organizer", "admin"), async (req: AuthRequest, res) => {
  const { qr_code } = req.body;
  if (!qr_code) return res.status(400).json({ error: "qr_code manquant" });

  try {
    const ticket = await pool.query("SELECT * FROM tickets WHERE qr_code = $1", [qr_code]);
    if (ticket.rows.length === 0) {
      return res.status(404).json({ error: "Billet invalide" });
    }
    const t = ticket.rows[0];
    if (t.status === "used") {
      return res.status(409).json({ error: "Billet déjà utilisé" });
    }
    if (t.status === "cancelled") {
      return res.status(409).json({ error: "Billet annulé" });
    }

    await pool.query("UPDATE tickets SET status = 'used' WHERE id = $1", [t.id]);
    await pool.query(
      "INSERT INTO checkins (ticket_id, checked_in_by) VALUES ($1, $2)",
      [t.id, req.user!.id]
    );

    res.json({ message: "Check-in réussi", ticket_id: t.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;