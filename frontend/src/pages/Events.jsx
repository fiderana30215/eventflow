import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/client";

export default function Events() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    apiClient.get("/events").then((res) => setEvents(res.data));
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: "40px auto" }}>
      <h2>Événements à venir</h2>
      {events.length === 0 && <p>Aucun événement publié pour le moment.</p>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {events.map((ev) => (
          <li key={ev.id} style={{ border: "1px solid #ddd", padding: 16, marginBottom: 12, borderRadius: 8 }}>
            <h3>
              <Link to={`/events/${ev.id}`}>{ev.title}</Link>
            </h3>
            <p>{ev.location}</p>
            <p>{new Date(ev.start_date).toLocaleString("fr-FR")}</p>
            <p>Organisé par {ev.organizer_name}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}