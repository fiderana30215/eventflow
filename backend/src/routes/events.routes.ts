import { Router } from "express";
import { pool } from "../config/db";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";

const router = Router();

// Liste publique des événements publiés
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, u.full_name AS organizer_name
       FROM events e
       JOIN users u ON u.id = e.organizer_id
       WHERE e.status = 'published'
       ORDER BY e.start_date ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Détail d'un événement + catégories de billets
router.get("/:id", async (req, res) => {
  try {
    const event = await pool.query("SELECT * FROM events WHERE id = $1", [req.params.id]);
    if (event.rows.length === 0) return res.status(404).json({ error: "Événement introuvable" });

    const categories = await pool.query(
      "SELECT * FROM ticket_categories WHERE event_id = $1",
      [req.params.id]
    );
    res.json({ ...event.rows[0], categories: categories.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Créer un événement (organisateur)
router.post("/", authenticate, authorize("organizer", "admin"), async (req: AuthRequest, res) => {
  const { title, description, location, start_date, end_date, cover_image_url } = req.body;
  if (!title || !start_date || !end_date) {
    return res.status(400).json({ error: "Champs manquants" });
  }
  try {
    const result = await pool.query(
      `INSERT INTO events (organizer_id, title, description, location, start_date, end_date, cover_image_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft')
       RETURNING *`,
      [req.user!.id, title, description, location, start_date, end_date, cover_image_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Publier un événement
router.patch("/:id/publish", authenticate, authorize("organizer", "admin"), async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      `UPDATE events SET status = 'published', updated_at = NOW()
       WHERE id = $1 AND organizer_id = $2 RETURNING *`,
      [req.params.id, req.user!.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Non autorisé ou introuvable" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Ajouter une catégorie de billets à un événement
router.post("/:id/categories", authenticate, authorize("organizer", "admin"), async (req: AuthRequest, res) => {
  const { name, price, quantity_total } = req.body;
  if (!name || quantity_total == null) {
    return res.status(400).json({ error: "Champs manquants" });
  }
  try {
    const result = await pool.query(
      `INSERT INTO ticket_categories (event_id, name, price, quantity_total)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.params.id, name, price || 0, quantity_total]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Statistiques organisateur
router.get("/:id/stats", authenticate, authorize("organizer", "admin"), async (req: AuthRequest, res) => {
  try {
    const stats = await pool.query(
      `SELECT
        COUNT(t.id) AS total_tickets_sold,
        COALESCE(SUM(p.amount), 0) AS total_revenue,
        COUNT(c.id) FILTER (WHERE c.id IS NOT NULL) AS total_checkins
       FROM ticket_categories tc
       LEFT JOIN tickets t ON t.category_id = tc.id
       LEFT JOIN payments p ON p.ticket_id = t.id AND p.status = 'succeeded'
       LEFT JOIN checkins c ON c.ticket_id = t.id
       WHERE tc.event_id = $1`,
      [req.params.id]
    );
    res.json(stats.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;