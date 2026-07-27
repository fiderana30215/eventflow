import { useEffect, useState } from "react";
import apiClient from "../api/client";

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/tickets/my")
      .then((res) => setTickets(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <h1 className="page-title">Mes billets</h1>
      <p className="page-subtitle">Retrouve tous tes billets achetés.</p>

      {loading && <p className="empty-state">Chargement...</p>}
      {!loading && tickets.length === 0 && (
        <p className="empty-state">Tu n'as encore acheté aucun billet.</p>
      )}

      {tickets.map((t) => (
        <div key={t.id} className="ticket-row">
          <div className="ticket-row-info">
            <strong>{t.event_title}</strong>
            <p>
              {t.category_name} · {new Date(t.start_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </p>
            <p style={{ fontSize: 12, opacity: 0.7 }}>Code : {t.qr_code}</p>
          </div>
          <span className="badge" style={{
            background: t.status === "valid" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
            color: t.status === "valid" ? "var(--success)" : "var(--danger)"
          }}>
            {t.status === "valid" ? "Valide" : t.status === "used" ? "Utilisé" : "Annulé"}
          </span>
        </div>
      ))}
    </div>
  );
}