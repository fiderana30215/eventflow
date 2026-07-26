import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/client";

export default function MyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/events/mine")
      .then((res) => setEvents(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Mes événements</h1>
        <Link to="/create">
          <button>+ Créer un événement</button>
        </Link>
      </div>
      <p className="page-subtitle">Gère tes événements, ajoute des billets et publie-les.</p>

      {loading && <p className="empty-state">Chargement...</p>}
      {!loading && events.length === 0 && (
        <p className="empty-state">Tu n'as pas encore créé d'événement.</p>
      )}

      <div className="event-grid">
        {events.map((ev) => (
          <Link key={ev.id} to={`/manage/${ev.id}`} className="event-card">
            <span className="badge">{ev.status}</span>
            <h3>{ev.title}</h3>
            <div className="event-meta">📍 {ev.location}</div>
            <div className="event-meta">
              🕒 {new Date(ev.start_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}