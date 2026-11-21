import { useState, useEffect } from "react";
import api from "../api";

export default function Registrations() {
  const [registrations, setRegistrations] = useState([]);
  const [regOpen,  setRegOpen]   = useState(true);
  const [loading,  setLoading]   = useState(true);
  const [working,  setWorking]   = useState(null); // id currently being actioned
  const [error,    setError]     = useState("");
  const [success,  setSuccess]   = useState("");

  async function load() {
    try {
      const [rr, sr] = await Promise.all([api.getRegistrations(), api.getStatus()]);
      setRegistrations(rr.data);
      setRegOpen(sr.data.registrationOpen);
    } catch {
      setError("Could not load registrations.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleApprove(id, name) {
    setWorking(id); setError(""); setSuccess("");
    try {
      await api.approveRegistration(id);
      setSuccess(`${name} approved and added to the draw!`);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to approve.");
    } finally {
      setWorking(null);
    }
  }

  async function handleReject(id, name) {
    if (!confirm(`Reject ${name}'s registration?`)) return;
    setWorking(id); setError(""); setSuccess("");
    try {
      await api.rejectRegistration(id);
      setSuccess(`${name}'s registration removed.`);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reject.");
    } finally {
      setWorking(null);
    }
  }

  async function toggleRegistration() {
    setError(""); setSuccess("");
    try {
      await api.setRegistrationStatus(!regOpen);
      setRegOpen(!regOpen);
      setSuccess(regOpen ? "Registration closed." : "Registration opened.");
    } catch (err) {
      setError("Failed to update registration status.");
    }
  }

  // Copy link to clipboard
  const regLink = `${window.location.origin}/register`;
  function copyLink() {
    navigator.clipboard.writeText(regLink);
    setSuccess("Link copied! Share it in your family WhatsApp group.");
  }

  return (
    <div>
      <div className="page-header">
        <h1>📬 Registrations</h1>
        {registrations.length > 0 && (
          <span className="badge badge-red">{registrations.length} pending</span>
        )}
      </div>

      {error   && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Share link card */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 16, marginBottom: 8 }}>📎 Registration Link</h2>
        <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 14 }}>
          Share this link in your family WhatsApp group. Each person opens it, picks their name from the list, and enters their email. It saves instantly — you can see emails filling in under <strong>Members</strong>.
        </p>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{
            flex: 1, background: "var(--bg)", border: "1px solid var(--border)",
            borderRadius: 7, padding: "10px 14px", fontSize: 14, fontFamily: "monospace",
            color: "var(--text)", wordBreak: "break-all"
          }}>
            {regLink}
          </div>
          <button className="btn btn-green" onClick={copyLink}>📋 Copy Link</button>
        </div>
        <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 14 }}>
            Registration is currently: <strong style={{ color: regOpen ? "var(--green)" : "var(--red)" }}>
              {regOpen ? "Open ✅" : "Closed 🔒"}
            </strong>
          </span>
          <button className="btn btn-ghost btn-sm" onClick={toggleRegistration}>
            {regOpen ? "🔒 Close Registration" : "✅ Open Registration"}
          </button>
        </div>
      </div>

      {/* Pending registrations */}
      <div className="card">
        <h2 style={{ fontSize: 16, marginBottom: 16 }}>Pending Approvals</h2>
        {loading ? (
          <div style={{ textAlign: "center", padding: 32 }}><span className="spinner" /></div>
        ) : registrations.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📭</div>
            <p>No pending registrations. Share the link above to get people to sign up.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Family</th>
                  <th>Submitted</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {registrations.map(r => (
                  <tr key={r.id}>
                    <td><strong>{r.name}</strong></td>
                    <td style={{ fontSize: 13, color: "var(--muted)" }}>{r.email}</td>
                    <td><span className="badge badge-gray">{r.familyName}</span></td>
                    <td style={{ fontSize: 12, color: "var(--muted)" }}>
                      {new Date(r.submittedAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn btn-green btn-sm"
                        style={{ marginRight: 6 }}
                        disabled={working === r.id}
                        onClick={() => handleApprove(r.id, r.name)}
                      >
                        {working === r.id ? <span className="spinner" /> : "✅ Approve"}
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: "var(--red)" }}
                        disabled={working === r.id}
                        onClick={() => handleReject(r.id, r.name)}
                      >
                        ❌ Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
