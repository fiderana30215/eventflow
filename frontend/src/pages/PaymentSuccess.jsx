import { Link } from "react-router-dom";

export default function PaymentSuccess() {
  return (
    <div className="page-narrow" style={{ textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
      <h1 className="page-title">Paiement réussi !</h1>
      <p className="page-subtitle">
        Ton billet a été généré et envoyé par email avec ton QR code d'entrée.
      </p>
      <Link to="/my-tickets">
        <button style={{ width: "100%", marginBottom: 10 }}>Voir mes billets</button>
      </Link>
      <Link to="/">
        <button className="secondary" style={{ width: "100%" }}>Retour aux événements</button>
      </Link>
    </div>
  );
}