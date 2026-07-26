import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({ email: "", password: "", full_name: "", role: "participant" });
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Erreur d'inscription");
    }
  };

  return (
    <div className="page-narrow">
      <h1 className="page-title">Inscription</h1>
      <p className="page-subtitle">Crée ton compte pour réserver ou organiser.</p>
      <form onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}
        <div className="form-group">
          <label>Nom complet</label>
          <input name="full_name" onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input name="email" type="email" onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Mot de passe</label>
          <input name="password" type="password" onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Je suis</label>
          <select name="role" onChange={handleChange}>
            <option value="participant">Participant</option>
            <option value="organizer">Organisateur</option>
          </select>
        </div>
        <button type="submit" style={{ width: "100%" }}>S'inscrire</button>
      </form>
      <p className="form-footer">
        Déjà un compte ? <Link to="/login">Se connecter</Link>
      </p>
    </div>
  );
}