import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
    <div style={{ maxWidth: 400, margin: "60px auto" }}>
      <h2>Inscription</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="full_name"
          placeholder="Nom complet"
          onChange={handleChange}
          required
          style={{ display: "block", width: "100%", marginBottom: 10 }}
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          required
          style={{ display: "block", width: "100%", marginBottom: 10 }}
        />
        <input
          name="password"
          type="password"
          placeholder="Mot de passe"
          onChange={handleChange}
          required
          style={{ display: "block", width: "100%", marginBottom: 10 }}
        />
        <select name="role" onChange={handleChange} style={{ display: "block", width: "100%", marginBottom: 10 }}>
          <option value="participant">Participant</option>
          <option value="organizer">Organisateur</option>
        </select>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit">S'inscrire</button>
      </form>
    </div>
  );
}