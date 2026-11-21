import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function Draw() {
  const [status,  setStatus]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [error,   setError]   = useState("");

  async function loadStatus() {
    try {
      const r = await api.getStatus();
      setStatus(r.data);
    } catch {
      setError("Could not load status.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadStatus(); }, []);

  async function handleDraw() {
    if (!confirm("Run the Secret Santa draw? This will send assignment emails to everyone. Are you sure?")) return;
    setRunning(true); setError(""); setResults(null);
    try {
      const r = await api.runDraw();
      setResults(r.data);
      await loadStatus();
    } catch (err) {
      setError(err.response?.data?.error || "Draw failed.");
    } finally {
      setRunning(false);
    }
  }

  async function handleReset() {
    if (!confirm("Reset the draw? This clears all assignments. You will need to run the draw again.")) return;
    setError(""); setResults(null);
    try {
      await api.resetDraw();
      await loadStatus();
    } catch (err) {
      setError(err.response?.data?.error || "Reset failed.");
    }
  }

  if (loading) return <div style={{ textAlign: "center", padding: 48 }}><span className="spinner" /></div>;

  const ready = status?.memberCount >= 2 && status?.meetupDate;
  const drawDone = status?.drawDone;

  return (
    <div>
      <div className="page-header">
        <h1>🎲 Run the Draw</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Pre-draw checklist */}
      {!drawDone && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 17, marginBottom: 16 }}>Before you draw — checklist</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <CheckItem ok={status?.familyCount > 0} label={`Families added (${status?.familyCount ?? 0})`} link="/families" />
            <CheckItem ok={status?.memberCount >= 2} label={`At least 2 participants (${status?.memberCount ?? 0})`} link="/members" />
            <CheckItem ok={!!status?.meetupDate} label={status?.meetupDate ? `Meetup date set: ${new Date(status.meetupDate).toLocaleDateString()}` : "Meetup date not set yet"} link="/settings" />
          </div>
        </div>
      )}

      {/* Draw button or done state */}
      <div className="card" style={{ textAlign: "center", padding: 40 }}>
        {drawDone ? (
          <>
            <div style={{ fontSize: 64 }}>🎉</div>
            <h2 style={{ marginTop: 12, marginBottom: 8, fontSize: 22 }}>Draw is done!</h2>
            <p style={{ color: "var(--muted)", marginBottom: 24 }}>
              {status.memberCount} assignments made. Everyone has been emailed their person.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
              <Link to="/assignments" className="btn btn-green">📋 View Assignments</Link>
              <button className="btn btn-ghost" style={{ color: "var(--red)" }} onClick={handleReset}>
                🔄 Reset Draw
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 64 }}>🎅</div>
            <h2 style={{ marginTop: 12, marginBottom: 8, fontSize: 22 }}>Ready to draw?</h2>
            <p style={{ color: "var(--muted)", marginBottom: 24 }}>
              This will randomly assign everyone a person to gift — no same-family matches.
              Assignment emails go out immediately.
            </p>
            <button className="btn btn-red" style={{ fontSize: 17, padding: "14px 32px" }} onClick={handleDraw} disabled={running || !ready}>
              {running ? <><span className="spinner" /> Drawing...</> : "🎲 Run the Draw!"}
            </button>
            {!ready && (
              <p style={{ color: "var(--red)", fontSize: 13, marginTop: 12 }}>
                Complete the checklist above first.
              </p>
            )}
          </>
        )}
      </div>

      {/* Email results */}
      {results && (
        <div className="card" style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 16, marginBottom: 16 }}>📧 Email Results</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Person</th><th>Status</th></tr>
              </thead>
              <tbody>
                {results.emailResults.map((r, i) => (
                  <tr key={i}>
                    <td>{r.name}</td>
                    <td>
                      {r.status === "sent"
                        ? <span className="badge badge-green">✅ Sent</span>
                        : r.status.startsWith("skipped")
                        ? <span className="badge badge-gold">🖨 Print slip needed</span>
                        : <span className="badge badge-red">❌ {r.status}</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 16 }}>
            <Link to="/assignments" className="btn btn-green btn-sm">View all assignments & print slips →</Link>
          </div>
        </div>
      )}
    </div>
  );
}

function CheckItem({ ok, label, link }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 20 }}>{ok ? "✅" : "❌"}</span>
      <span style={{ flex: 1, fontSize: 15 }}>{label}</span>
      {!ok && (
        <Link to={link} className="btn btn-ghost btn-sm">Fix →</Link>
      )}
    </div>
  );
}
