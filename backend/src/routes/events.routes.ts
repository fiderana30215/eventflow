import { Router } from "express";
import { pool } from "../config/db";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Liste des événements publiés
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: Liste des événements
 */
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

/**
 * @swagger
 * /events/mine:
 *   get:
 *     summary: Liste des événements de l'organisateur connecté (tous statuts)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des événements
 */
router.get("/mine", authenticate, authorize("organizer", "admin"), async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM events WHERE organizer_id = $1 ORDER BY created_at DESC",
      [req.user!.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Détail d'un événement avec ses catégories de billets
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détail de l'événement
 *       404:
 *         description: Événement introuvable
 */
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

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Créer un événement (organisateur)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               location: { type: string }
 *               start_date: { type: string, format: date-time }
 *               end_date: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: Événement créé
 *       401:
 *         description: Non authentifié
 */
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

/**
 * @swagger
 * /events/{id}/publish:
 *   patch:
 *     summary: Publier un événement
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Événement publié
 */
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

/**
 * @swagger
 * /events/{id}/categories:
 *   post:
 *     summary: Ajouter une catégorie de billets
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               price: { type: number }
 *               quantity_total: { type: integer }
 *     responses:
 *       201:
 *         description: Catégorie créée
 */
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

/**
 * @swagger
 * /events/{id}/stats:
 *   get:
 *     summary: Statistiques d'un événement (organisateur)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Statistiques
 */
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