import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/client";

export default function CreateEvent() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    start_date: "",
    end_date: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await apiClient.post("/events", {
        ...form,
        start_date: new Date(form.start_date).toISOString(),
        end_date: new Date(form.end_date).toISOString(),
      });
      navigate(`/manage/${data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Erreur lors de la création");
    }
  };

  return (
    <div className="page-narrow">
      <h1 className="page-title">Créer un événement</h1>
      <p className="page-subtitle">Renseigne les informations de base, tu ajouteras les billets ensuite.</p>
      <form onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}
        <div className="form-group">
          <label>Titre</label>
          <input name="title" onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea name="description" rows={4} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Lieu</label>
          <input name="location" onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Date et heure de début</label>
          <input type="datetime-local" name="start_date" onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Date et heure de fin</label>
          <input type="datetime-local" name="end_date" onChange={handleChange} required />
        </div>
        <button type="submit" style={{ width: "100%" }}>Continuer</button>
      </form>
    </div>
  );
}