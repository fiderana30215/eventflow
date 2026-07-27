import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Scan from "./pages/Scan";
import CreateEvent from "./pages/CreateEvent";
import EventManage from "./pages/EventManage";
import MyEvents from "./pages/MyEvents";
import MyTickets from "./pages/MyTickets";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancelled from "./pages/PaymentCancelled";

const IconCalendar = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const IconFolder = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);
const IconTicket = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
  </svg>
);
const IconScan = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><line x1="7" y1="12" x2="17" y2="12" />
  </svg>
);
const IconLogout = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

function Nav() {
  const { user, logout } = useAuth();
  const isOrganizer = user && (user.role === "organizer" || user.role === "admin");

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        EventFlow
      </Link>
      <div className="navbar-links">
        <Link to="/" className="nav-icon-link">
          <IconCalendar />
          <span>Tous les événements</span>
        </Link>
        {user && !isOrganizer && (
          <Link to="/my-tickets" className="nav-icon-link">
            <IconTicket />
            <span>Mes billets</span>
          </Link>
        )}
        {isOrganizer && (
          <>
            <Link to="/my-events" className="nav-icon-link">
              <IconFolder />
              <span>Mes événements</span>
            </Link>
            <Link to="/scan" className="nav-icon-link">
              <IconScan />
              <span>Scanner</span>
            </Link>
          </>
        )}
      </div>
      {user ? (
        <div className="navbar-user">
          <span>{user.full_name}</span>
          <span className="badge">{user.role}</span>
          <button className="secondary nav-icon-link" onClick={logout} title="Déconnexion">
            <IconLogout />
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
          <Route path="/create" element={<CreateEvent />} />
          <Route path="/manage/:id" element={<EventManage />} />
          <Route path="/my-events" element={<MyEvents />} />
          <Route path="/my-tickets" element={<MyTickets />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-cancelled" element={<PaymentCancelled />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}