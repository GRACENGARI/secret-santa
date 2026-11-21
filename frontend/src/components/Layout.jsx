import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";
import "./Layout.css";

const baseNav = [
  { to: "/",               label: "🏠 Dashboard" },
  { to: "/families",       label: "👨‍👩‍👧 Families" },
  { to: "/members",        label: "🧑 Members" },
  { to: "/registrations",  label: "📬 Registrations" },
  { to: "/draw",           label: "🎲 Run Draw" },
  { to: "/assignments",    label: "📋 Assignments" },
  { to: "/settings",       label: "⚙️ Settings" },
];

export default function Layout() {
  const navigate = useNavigate();
  const [pending, setPending] = useState(0);

  useEffect(() => {
    // Poll for pending registrations every 30s
    function check() {
      api.getStatus().then(r => setPending(r.data.pendingRegistrations || 0)).catch(() => {});
    }
    check();
    const t = setInterval(check, 30000);
    return () => clearInterval(t);
  }, []);

  function logout() {
    sessionStorage.removeItem("adminPassword");
    navigate("/login");
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="sidebar-logo-icon">🎅</span>
          <span className="sidebar-logo-text">Secret Santa</span>
        </div>
        <nav className="sidebar-nav">
          {baseNav.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
            >
              {label}
              {to === "/registrations" && pending > 0 && (
                <span style={{
                  marginLeft: "auto",
                  background: "#c0392b",
                  color: "#fff",
                  borderRadius: "10px",
                  padding: "1px 7px",
                  fontSize: "11px",
                  fontWeight: 700,
                }}>
                  {pending}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <button className="btn btn-ghost btn-sm logout-btn" onClick={logout}>
          🚪 Logout
        </button>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
