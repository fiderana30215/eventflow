import { useState } from "react";
import apiClient from "../api/client";

export default function Scan() {
  const [qrCode, setQrCode] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleScan = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    try {
      const { data } = await apiClient.post("/checkins", { qr_code: qrCode });
      setResult(data);
      setQrCode("");
    } catch (err) {
      setError(err.response?.data?.error || "Erreur de check-in");
    }
  };

  return (
    <div className="page-narrow">
      <h1 className="page-title">Check-in</h1>
      <p className="page-subtitle">Scanne ou colle le code du billet pour valider l'entrée.</p>
      <form onSubmit={handleScan}>
        <div className="form-group">
          <label>Code du billet (QR)</label>
          <input
            value={qrCode}
            onChange={(e) => setQrCode(e.target.value)}
            placeholder="Colle ou scanne le code ici"
            autoFocus
            required
          />
        </div>
        {error && <div className="form-error">{error}</div>}
        {result && (
          <div className="form-message">
            ✅ {result.message} — billet #{result.ticket_id}
          </div>
        )}
        <button type="submit" style={{ width: "100%" }}>Valider</button>
      </form>
    </div>
  );
}