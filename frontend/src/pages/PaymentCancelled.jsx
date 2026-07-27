import { Link } from "react-router-dom";

export default function PaymentCancelled() {
  return (
    <div className="page-narrow" style={{ textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
      <h1 className="page-title">Paiement annulé</h1>
      <p className="page-subtitle">
        Ton paiement n'a pas été finalisé. Aucun montant n'a été débité.
      </p>
      <Link to="/">
        <button style={{ width: "100%" }}>Retour aux événements</button>
      </Link>
    </div>
  );
}