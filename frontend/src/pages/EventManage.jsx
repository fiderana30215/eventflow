import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../api/client";

export default function EventManage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [stats, setStats] = useState(null);
  const [catForm, setCatForm] = useState({ name: "", price: "", quantity_total: "" });
  const [editForm, setEditForm] = useState(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  const loadEvent = () => {
    apiClient.get(`/events/${id}`).then((res) => {
      setEvent(res.data);
      setEditForm({
        title: res.data.title,
        description: res.data.description || "",
        location: res.data.location,
        start_date: res.data.start_date?.slice(0, 16),
        end_date: res.data.end_date?.slice(0, 16),
      });
    });
    apiClient.get(`/events/${id}/stats`).then((res) => setStats(res.data));
  };

  useEffect(() => {
    loadEvent();
  }, [id]);

  const handleCatChange = (e) => setCatForm({ ...catForm, [e.target.name]: e.target.value });
  const handleEditChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

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

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await apiClient.put(`/events/${id}`, {
        ...editForm,
        start_date: new Date(editForm.start_date).toISOString(),
        end_date: new Date(editForm.end_date).toISOString(),
      });
      setEditing(false);
      setMessage("Événement mis à jour.");
      loadEvent();
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de la modification");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Supprimer définitivement cet événement ? Cette action est irréversible.")) return;
    setError("");
    try {
      await apiClient.delete(`/events/${id}`);
      navigate("/my-events");
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de la suppression");
    }
  };

  if (!event) return <p className="empty-state">Chargement...</p>;

  const imageUrl = event.cover_image_url ? `http://localhost:4000${event.cover_image_url}` : null;

  return (
    <div className="page" style={{ maxWidth: 700 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <span className="badge">{event.status}</span>
          {!editing && <h1 className="page-title" style={{ marginTop: 12 }}>{event.title}</h1>}
        </div>
        {!editing && (
          <div style={{ display: "flex", gap: 8 }}>
            <button className="secondary" onClick={() => setEditing(true)}>Modifier</button>
            <button className="secondary" onClick={handleDelete} style={{ color: "var(--danger)" }}>Supprimer</button>
          </div>
        )}
      </div>
      {!editing && <p className="page-subtitle">{event.location}</p>}

      {message && <div className="form-message">{message}</div>}
      {error && <div className="form-error">{error}</div>}

      {!editing && stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
          <div className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{stats.total_tickets_sold}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Billets vendus</div>
          </div>
          <div className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{Number(stats.total_revenue).toLocaleString("fr-FR")} €</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Revenu total</div>
          </div>
          <div className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{stats.total_checkins}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Entrées validées</div>
          </div>
        </div>
      )}

      {editing ? (
        <form onSubmit={handleSaveEdit} className="card" style={{ marginBottom: 28 }}>
          <div className="form-group">
            <label>Titre</label>
            <input name="title" value={editForm.title} onChange={handleEditChange} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" rows={4} value={editForm.description} onChange={handleEditChange} />
          </div>
          <div className="form-group">
            <label>Lieu</label>
            <input name="location" value={editForm.location} onChange={handleEditChange} required />
          </div>
          <div className="form-group">
            <label>Date et heure de début</label>
            <input type="datetime-local" name="start_date" value={editForm.start_date} onChange={handleEditChange} required />
          </div>
          <div className="form-group">
            <label>Date et heure de fin</label>
            <input type="datetime-local" name="end_date" value={editForm.end_date} onChange={handleEditChange} required />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" style={{ flex: 1 }}>Enregistrer</button>
            <button type="button" className="secondary" onClick={() => setEditing(false)} style={{ flex: 1 }}>Annuler</button>
          </div>
        </form>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}