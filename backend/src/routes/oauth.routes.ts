import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { pool } from "../config/db";

const router = Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Le frontend envoie le id_token obtenu via Google Sign-In (bouton côté client)
router.post("/google", async (req, res) => {
  const { id_token } = req.body;
  if (!id_token) return res.status(400).json({ error: "id_token manquant" });

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(401).json({ error: "Token Google invalide" });
    }

    const { email, name, sub: googleId } = payload;

    let result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    let user;

    if (result.rows.length === 0) {
      const insert = await pool.query(
        `INSERT INTO users (email, full_name, role, oauth_provider, oauth_id)
         VALUES ($1, $2, 'participant', 'google', $3)
         RETURNING *`,
        [email, name || email, googleId]
      );
      user = insert.rows[0];
    } else {
      user = result.rows[0];
      if (!user.oauth_provider) {
        await pool.query(
          "UPDATE users SET oauth_provider = 'google', oauth_id = $1 WHERE id = $2",
          [googleId, user.id]
        );
      }
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET as string, {
      expiresIn: "7d",
    });

    res.json({
      user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Échec de l'authentification Google" });
  }
});

export default router;