import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/client";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/events")
      .then((res) => setEvents(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <h1 className="page-title">Événements à venir</h1>
      <p className="page-subtitle">Découvre et réserve tes billets en quelques clics.</p>

      {loading && <p className="empty-state">Chargement...</p>}
      {!loading && events.length === 0 && (
        <p className="empty-state">Aucun événement publié pour le moment.</p>
      )}

      <div className="event-grid">
        {events.map((ev) => (
          <Link key={ev.id} to={`/events/${ev.id}`} className="event-card">
            {ev.cover_image_url ? (
              <img
                className="event-card-image"
                src={`http://localhost:4000${ev.cover_image_url}`}
                alt={ev.title}
              />
            ) : (
              <div className="event-card-image" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 13 }}>
                Pas de flyer
              </div>
            )}
            <div className="event-card-body">
              <span className="badge">{new Date(ev.start_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
              <h3>{ev.title}</h3>
              <div className="event-meta">📍 {ev.location}</div>
              <div className="event-meta">🕒 {new Date(ev.start_date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</div>
              <div className="event-meta">Organisé par {ev.organizer_name}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}