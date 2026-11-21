import { useState, useEffect } from "react";
import api from "../api";
import "./Login.css";

export default function Register() {
  const [families,   setFamilies]   = useState([]);
  const [members,    setMembers]    = useState([]);
  const [open,       setOpen]       = useState(true);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done,       setDone]       = useState(false);
  const [message,    setMessage]    = useState("");
  const [error,      setError]      = useState("");

  const [familyId,   setFamilyId]   = useState("");
  const [memberId,   setMemberId]   = useState("");
  const [email,      setEmail]      = useState("");

  useEffect(() => {
    api.getPublicFamilies()
      .then(r => {
        setFamilies(r.data.families || []);
        setOpen(r.data.registrationOpen !== false);
      })
      .catch(() => setError("Could not connect to the app. Make sure the backend is running."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!familyId) { setMembers([]); setMemberId(""); setEmail(""); return; }
    api.getMembersPublic(familyId)
      .then(r => { setMembers(r.data); setMemberId(""); setEmail(""); setError(""); })
      .catch(() => setError("Could not load family members."));
  }, [familyId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true); setError("");
    try {
      const r = await api.memberCheckin({ memberId, email });
      setMessage(`You're all set, ${r.data.name}! Watch your inbox for your Secret Santa assignment 🎁`);
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const selectedMember = members.find(m => m.id === memberId);
  const isPrintSlip = selectedMember?.noSmartphone;

  if (done) {
    return (
      <div className="login-page">
        <div className="login-card card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>🎉</div>
          <h2 style={{ marginBottom: 12 }}>You're registered!</h2>
          <div className="alert alert-success">{message}</div>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 16 }}>
            🤫 Keep it a secret until the meetup!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card card">
        <div className="login-header">
          <div className="login-icon">🎅</div>
          <h1>Secret Santa</h1>
          <p>Find your name and add your email so we can send you your Secret Santa assignment</p>
        </div>

        {loading && <div style={{ textAlign: "center", padding: 16 }}><span className="spinner" /></div>}

        {!loading && !open && (
          <div className="alert alert-info">
            Registration is currently closed. Ask the organiser to open it.
          </div>
        )}

        {!loading && open && (
          <>
            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>

              {/* Step 1 — Family */}
              <div className="form-group">
                <label>Step 1 — Your Family</label>
                <select
                  value={familyId}
                  onChange={e => { setFamilyId(e.target.value); setError(""); }}
                  required
                >
                  <option value="">— Select your family —</option>
                  {families.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              {/* No members in this family yet */}
              {familyId && members.length === 0 && (
                <div className="alert alert-info">
                  No names found for this family yet. Ask the organiser to add you first.
                </div>
              )}

              {/* Step 2 — Name */}
              {familyId && members.length > 0 && (
                <div className="form-group">
                  <label>Step 2 — Your Name</label>
                  <select
                    value={memberId}
                    onChange={e => { setMemberId(e.target.value); setEmail(""); setError(""); }}
                    required
                  >
                    <option value="">— Select your name —</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                        {m.hasEmail ? " ✅" : ""}
                        {m.noSmartphone ? " (printed slip)" : ""}
                      </option>
                    ))}
                  </select>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>
                    ✅ = email already saved
                  </span>
                </div>
              )}

              {/* Print slip person — no email needed */}
              {memberId && isPrintSlip && (
                <div className="alert alert-info">
                  You are set up to receive a <strong>printed slip</strong> — no email needed.
                  The organiser will hand it to you personally at the meetup. 🎁
                </div>
              )}

              {/* Step 3 — Email (only for non-print-slip) */}
              {memberId && !isPrintSlip && (
                <div className="form-group">
                  <label>Step 3 — Your Email Address</label>
                  <input
                    type="email"
                    placeholder="yourname@gmail.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoFocus
                    required
                  />
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>
                    Your Secret Santa assignment will be sent here — only you will see it. 🤫
                  </span>
                </div>
              )}

              {/* Submit button (only for non-print-slip) */}
              {memberId && !isPrintSlip && (
                <button
                  className="btn btn-red"
                  style={{ width: "100%", justifyContent: "center", padding: "13px", fontSize: 16 }}
                  disabled={submitting}
                >
                  {submitting ? <span className="spinner" /> : "Save my email 🎁"}
                </button>
              )}

            </form>
          </>
        )}
      </div>
    </div>
  );
}
