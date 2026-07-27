import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../api/client";

export default function EventManage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [catForm, setCatForm] = useState({ name: "", price: "", quantity_total: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  const loadEvent = () => {
    apiClient.get(`/events/${id}`).then((res) => setEvent(res.data));
  };

  useEffect(() => {
    loadEvent();
  }, [id]);

  const handleCatChange = (e) => setCatForm({ ...catForm, [e.target.name]: e.target.value });

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await apiClient.post(`/events/${id}/categories`, {
        name: catForm.name,
        price: Number(catForm.price),
        quantity_total: Number(catForm.quantity_total),
      });
      setCatForm({ name: "", price: "", quantity_total: "" });
      loadEvent();
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'ajout");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      await apiClient.post(`/events/${id}/cover-image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      loadEvent();
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de l'upload de l'image");
    } finally {
      setUploading(false);
    }
  };

  const handlePublish = async () => {
    setError("");
    try {
      await apiClient.patch(`/events/${id}/publish`);
      setMessage("Événement publié !");
      loadEvent();
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de la publication");
    }
  };

  if (!event) return <p className="empty-state">Chargement...</p>;

  const imageUrl = event.cover_image_url ? `http://localhost:4000${event.cover_image_url}` : null;

  return (
    <div className="page" style={{ maxWidth: 700 }}>
      <span className="badge">{event.status}</span>
      <h1 className="page-title" style={{ marginTop: 12 }}>{event.title}</h1>
      <p className="page-subtitle">{event.location}</p>

      {message && <div className="form-message">{message}</div>}
      {error && <div className="form-error">{error}</div>}

      <h2 style={{ fontSize: 18, marginBottom: 14 }}>Flyer / Image de couverture</h2>
      <div className="card" style={{ marginBottom: 28 }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Flyer de l'événement"
            style={{ width: "100%", borderRadius: 8, marginBottom: 14, display: "block" }}
          />
        ) : (
          <div className="empty-state" style={{ padding: 30 }}>Aucun flyer ajouté pour l'instant.</div>
        )}
        <label htmlFor="cover-upload">
          <div className="secondary" style={{
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "10px 20px",
            textAlign: "center",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 600,
          }}>
            {uploading ? "Envoi en cours..." : imageUrl ? "Changer le flyer" : "Ajouter un flyer"}
          </div>
        </label>
        <input
          id="cover-upload"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageUpload}
          style={{ display: "none" }}
          disabled={uploading}
        />
      </div>

      <h2 style={{ fontSize: 18, marginBottom: 14 }}>Catégories de billets</h2>
      {event.categories?.length === 0 && <p className="empty-state">Aucune catégorie pour l'instant.</p>}
      {event.categories?.map((cat) => (
        <div key={cat.id} className="ticket-row">
          <div className="ticket-row-info">
            <strong>{cat.name}</strong>
            <p>{cat.price} € · {cat.quantity_total - cat.quantity_sold} / {cat.quantity_total} restantes</p>
          </div>
        </div>
      ))}

      <form onSubmit={handleAddCategory} className="card" style={{ marginTop: 16, marginBottom: 28 }}>
        <div className="form-group">
          <label>Nom de la catégorie</label>
          <input name="name" value={catForm.name} onChange={handleCatChange} required />
        </div>
        <div className="form-group">
          <label>Prix (Ar)</label>
          <input type="number" name="price" value={catForm.price} onChange={handleCatChange} required />
        </div>
        <div className="form-group">
          <label>Quantité disponible</label>
          <input type="number" name="quantity_total" value={catForm.quantity_total} onChange={handleCatChange} required />
        </div>
        <button type="submit" style={{ width: "100%" }}>Ajouter la catégorie</button>
      </form>

      {event.status !== "published" && (
        <button onClick={handlePublish} style={{ width: "100%" }}>
          Publier l'événement
        </button>
      )}
    </div>
  );
}