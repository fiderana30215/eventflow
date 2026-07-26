import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes";
import oauthRoutes from "./routes/oauth.routes";
import eventsRoutes from "./routes/events.routes";
import ticketsRoutes from "./routes/tickets.routes";
import checkinsRoutes from "./routes/checkins.routes";
import paymentsRoutes from "./routes/payments.routes";
import "./queues/email.worker"; // démarre le worker de la queue email

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

// Le webhook Stripe a besoin du body brut — doit être déclaré AVANT express.json()
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/auth", oauthRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/tickets", ticketsRoutes);
app.use("/api/checkins", checkinsRoutes);
app.use("/api/payments", paymentsRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));