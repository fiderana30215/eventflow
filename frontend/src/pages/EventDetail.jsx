import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";

const socket = io("http://localhost:4000");

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [message, setMessage] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    apiClient.get(`/events/${id}`).then((res) => setEvent(res.data));

    socket.emit("join-event", id);

    const handleUpdate = (data) => {
      setEvent((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          categories: prev.categories.map((cat) =>
            cat.id === data.categoryId
              ? { ...cat, quantity_sold: data.quantitySold }
              : cat
          ),
        };
      });
    };

    socket.on("tickets-update", handleUpdate);

    return () => {
      socket.emit("leave-event", id);
      socket.off("tickets-update", handleUpdate);
    };
  }, [id]);

  const handleBuy = async (categoryId) => {
    if (!user) {
      setMessage("Connectez-vous pour acheter un billet.");
      return;
    }
    try {
      const { data } = await apiClient.post("/payments/checkout", { category_id: categoryId });
      window.location.href = data.url;
    } catch (err) {
      setMessage(err.response?.data?.error || "Erreur lors de l'achat");
    }
  };

  if (!event) return <p className="empty-state">Chargement...</p>;

  const imageUrl = event.cover_image_url ? `http://localhost:4000${event.cover_image_url}` : null;

  return (
    <div className="page" style={{ maxWidth: 700 }}>
      {imageUrl && <img src={imageUrl} alt={event.title} className="event-banner" />}
      <span className="badge">{new Date(event.start_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
      <h1 className="page-title" style={{ marginTop: 12 }}>{event.title}</h1>
      <p className="page-subtitle">{event.description}</p>

      <div className="card" style={{ marginBottom: 28 }}>
        <div className="event-meta" style={{ marginBottom: 8 }}>📍 {event.location}</div>
        <div className="event-meta">
          🕒 {new Date(event.start_date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          {" — "}
          {new Date(event.end_date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>

      <h2 style={{ fontSize: 18, marginBottom: 14 }}>Billets</h2>
      {message && <div className="form-message">{message}</div>}

      {event.categories?.length === 0 && <p className="empty-state">Aucune catégorie de billets disponible.</p>}

      {event.categories?.map((cat) => {
        const remaining = cat.quantity_total - cat.quantity_sold;
        return (
          <div key={cat.id} className="ticket-row">
            <div className="ticket-row-info">
              <strong>{cat.name}</strong>
              <p>{cat.price} € · <span style={{ color: remaining <= 5 && remaining > 0 ? "var(--danger)" : "inherit" }}>{remaining} places restantes</span></p>
            </div>
            <button onClick={() => handleBuy(cat.id)} disabled={remaining <= 0}>
              {remaining > 0 ? "Acheter" : "Épuisé"}
            </button>
          </div>
        );
      })}
    </div>
  );
}