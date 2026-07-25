import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [message, setMessage] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    apiClient.get(`/events/${id}`).then((res) => setEvent(res.data));
  }, [id]);

  const handleBuy = async (categoryId) => {
    if (!user) {
      setMessage("Connectez-vous pour acheter un billet.");
      return;
    }
    try {
      const { data } = await apiClient.post("/payments/checkout", { category_id: categoryId });
      window.location.href = data.url; // redirige vers Stripe Checkout
    } catch (err) {
      setMessage(err.response?.data?.error || "Erreur lors de l'achat");
    }
  };

  if (!event) return <p>Chargement...</p>;

  return (
    <div style={{ maxWidth: 700, margin: "40px auto" }}>
      <h2>{event.title}</h2>
      <p>{event.description}</p>
      <p>{event.location}</p>
      <p>{new Date(event.start_date).toLocaleString("fr-FR")}</p>

      <h3>Billets</h3>
      {message && <p style={{ color: "orange" }}>{message}</p>}
      {event.categories?.map((cat) => (
        <div key={cat.id} style={{ border: "1px solid #ddd", padding: 12, marginBottom: 8, borderRadius: 6 }}>
          <strong>{cat.name}</strong> — {cat.price} €
          <p>{cat.quantity_total - cat.quantity_sold} places restantes</p>
          <button onClick={() => handleBuy(cat.id)}>Acheter</button>
        </div>
      ))}
    </div>
  );
}