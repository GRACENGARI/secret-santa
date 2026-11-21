import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function Dashboard() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStatus()
      .then(r => setStatus(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const meetupStr = status?.meetupDate
    ? new Date(status.meetupDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : null;

  const daysUntil = status?.meetupDate
    ? Math.round((new Date(status.meetupDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div>
      <div className="page-header">
        <h1>🏠 Dashboard</h1>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 48 }}><span className="spinner" /></div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-num" style={{ color: "var(--red)" }}>{status?.familyCount ?? 0}</div>
              <div className="stat-label">Families</div>
            </div>
            <div className="stat-card">
              <div className="stat-num" style={{ color: "var(--green)" }}>{status?.memberCount ?? 0}</div>
              <div className="stat-label">Participants</div>
            </div>
            <div className="stat-card">
              <div className="stat-num" style={{ color: "var(--gold)" }}>
                {status?.drawDone ? "✅" : "⏳"}
              </div>
              <div className="stat-label">Draw Status</div>
            </div>
            {daysUntil !== null && (
              <div className="stat-card">
                <div className="stat-num" style={{ color: "#8e44ad" }}>
                  {daysUntil < 0 ? "🎉" : daysUntil}
                </div>
                <div className="stat-label">{daysUntil < 0 ? "Meetup was" : "Days to meetup"}</div>
              </div>
            )}
          </div>

          {meetupStr && (
            <div className="alert alert-info" style={{ marginBottom: 24 }}>
              🗓️ Family meetup: <strong>{meetupStr}</strong>
              {daysUntil !== null && daysUntil >= 0 && ` — ${daysUntil} days away`}
            </div>
          )}

          <div className="card">
            <h2 style={{ marginBottom: 20, fontSize: 18 }}>Quick Actions</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <Link to="/families" className="btn btn-ghost">👨‍👩‍👧 Manage Families</Link>
              <Link to="/members"  className="btn btn-ghost">🧑 Manage Members</Link>
              <Link to="/draw"     className="btn btn-red">🎲 Run the Draw</Link>
              {status?.drawDone && (
                <Link to="/assignments" className="btn btn-green">📋 View Assignments</Link>
              )}
              <Link to="/settings" className="btn btn-ghost">⚙️ Settings</Link>
            </div>
          </div>

          {status?.pendingRegistrations > 0 && (
            <div className="alert alert-info" style={{ marginTop: 20 }}>
              📬 <strong>{status.pendingRegistrations} registration{status.pendingRegistrations > 1 ? "s" : ""}</strong> waiting for your approval. <Link to="/registrations" style={{ color: "var(--red)", fontWeight: 600 }}>Review now →</Link>
            </div>
          )}

          {!status?.meetupDate && (
            <div className="alert alert-info" style={{ marginTop: 20 }}>
              👋 Set your <Link to="/settings" style={{ color: "var(--red)", fontWeight: 600 }}>meetup date in Settings</Link> before running the draw so reminders can be scheduled automatically.
            </div>
          )}

          {status?.meetupDate && !status?.drawDone && status?.memberCount >= 2 && (
            <div className="alert alert-info" style={{ marginTop: 20 }}>
              ✅ You have {status.memberCount} participants across {status.familyCount} families. Ready to <Link to="/draw" style={{ color: "var(--red)", fontWeight: 600 }}>run the draw!</Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
