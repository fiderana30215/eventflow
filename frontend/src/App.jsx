import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Scan from "./pages/Scan";

function Nav() {
  const { user, logout } = useAuth();
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        EventFlow
      </Link>
      {user ? (
        <div className="navbar-user">
          {(user.role === "organizer" || user.role === "admin") && (
            <Link to="/scan">Scanner</Link>
          )}
          <span>{user.full_name}</span>
          <span className="badge">{user.role}</span>
          <button className="secondary" onClick={logout}>
            Déconnexion
          </button>
        </div>
      ) : (
        <div className="navbar-links">
          <Link to="/login">Connexion</Link>
          <Link to="/register">
            <button>S'inscrire</button>
          </Link>
        </div>
      )}
    </nav>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Nav />
        <Routes>
          <Route path="/" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}