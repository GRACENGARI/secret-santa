import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./Login.css";

export default function Login() {
  const [mode,     setMode]     = useState("home");   // "home" | "admin" | "member"
  const [families, setFamilies] = useState([]);
  const [members,  setMembers]  = useState([]);

  // Admin form
  const [password, setPassword] = useState("");

  // Member check-in form
  const [familyId,  setFamilyId]  = useState("");
  const [memberId,  setMemberId]  = useState("");
  const [email,     setEmail]     = useState("");
  const [checkedIn, setCheckedIn] = useState(false);
  const [memberName, setMemberName] = useState("");

  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  const navigate = useNavigate();

  // Load families + members for the member dropdown
  useEffect(() => {
    if (mode === "member") {
      api.getPublicFamilies()
        .then(r => setFamilies(r.data.families))
        .catch(() => setError("Could not load families. Make sure the app is running."));
    }
  }, [mode]);

  // When family is selected, load its members
  useEffect(() => {
    if (familyId) {
      api.getMembersPublic(familyId)
        .then(r => { setMembers(r.data); setMemberId(""); setEmail(""); })
        .catch(() => {});
    } else {
      setMembers([]);
    }
  }, [familyId]);

  // ── Admin login ────────────────────────────────────────────────────────────
  async function handleAdminLogin(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    sessionStorage.setItem("adminPassword", password);
    try {
      await api.getFamilies();
      navigate("/");
    } catch {
      sessionStorage.removeItem("adminPassword");
      setError("Wrong password.");
    } finally {
      setLoading(false);
    }
  }

  // ── Member check-in ────────────────────────────────────────────────────────
  async function handleMemberCheckin(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const r = await api.memberCheckin({ memberId, email });
      const name = r.data.name;
      setMemberName(name);
      setCheckedIn(true);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setMode("home");
    setPassword(""); setFamilyId(""); setMemberId(""); setEmail("");
    setCheckedIn(false); setError("");
  }

  // ── Home screen ────────────────────────────────────────────────────────────
  if (mode === "home") {
    return (
      <div className="login-page">
        <div className="login-card card">
          <div className="login-header">
            <div className="login-icon">🎅</div>
            <h1>Secret Santa 2026</h1>
            <p>Ndegwa Family Gift Exchange 🎁</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button
              className="btn btn-red"
              style={{ width: "100%", justifyContent: "center", fontSize: 16, padding: "14px" }}
              onClick={() => { setError(""); setMode("member"); }}
            >
              🧑 I'm a Family Member
            </button>
            <button
              className="btn btn-ghost"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => { setError(""); setMode("admin"); }}
            >
              🔐 I'm the Admin
            </button>
          </div>
          <p style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", marginTop: 16 }}>
            All we need from you right now is your email. That's it! You'll receive all the details closer to the meetup. 🎅
          </p>
        </div>
      </div>
    );
  }

  // ── Admin login ────────────────────────────────────────────────────────────
  if (mode === "admin") {
    return (
      <div className="login-page">
        <div className="login-card card">
          <div className="login-header">
            <div className="login-icon">🔐</div>
            <h1>Admin Login</h1>
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleAdminLogin}>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
                required
              />
            </div>
            <button className="btn btn-red" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
              {loading ? <span className="spinner" /> : "Login →"}
            </button>
          </form>
          <button className="btn btn-ghost btn-sm" style={{ marginTop: 12, width: "100%", justifyContent: "center" }} onClick={reset}>
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // ── Member check-in — success ──────────────────────────────────────────────
  if (mode === "member" && checkedIn) {
    return (
      <div className="login-page">
        <div className="login-card card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
          <h2 style={{ marginBottom: 8 }}>You're all set, {memberName}! 🎉</h2>
          <p style={{ color: "var(--muted)", fontSize: 15, marginBottom: 20 }}>
            Your email has been saved. That's all we need from you for now! You'll get all the Secret Santa details closer to the meetup. Keep an eye on your inbox! 🎁
          </p>
          <p style={{ fontSize: 13, color: "var(--muted)" }}>🤫 Don't tell anyone who you're gifting!</p>
          <button className="btn btn-ghost btn-sm" style={{ marginTop: 20 }} onClick={reset}>
            ← Back to home
          </button>
        </div>
      </div>
    );
  }

  // ── Member check-in — form ─────────────────────────────────────────────────
  const alreadyHasEmail = members.find(m => m.id === memberId)?.hasEmail;

  return (
    <div className="login-page">
      <div className="login-card card">
        <div className="login-header">
          <div className="login-icon">🧑</div>
          <h1>Hi there! 👋</h1>
          <p>Find your name and add your email — that's all we need from you right now!</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleMemberCheckin}>
          <div className="form-group">
            <label>Your Family</label>
            <select
              value={familyId}
              onChange={e => setFamilyId(e.target.value)}
              required
            >
              <option value="">— Select your family —</option>
              {families.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          {familyId && members.length === 0 && (
            <div className="alert alert-info">No members found in this family yet. Ask Grace to add you first.</div>
          )}

          {familyId && members.length > 0 && (
            <div className="form-group">
              <label>Your Name</label>
              <select
                value={memberId}
                onChange={e => { setMemberId(e.target.value); setEmail(""); }}
                required
              >
                <option value="">— Select your name —</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name}{m.hasEmail ? " ✅" : ""}
                  </option>
                ))}
              </select>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>
                ✅ means you already added your email — you can update it below
              </span>
            </div>
          )}

          {memberId && (
            <>
              {alreadyHasEmail && (
                <div className="alert alert-info" style={{ marginBottom: 12 }}>
                  You've already submitted your email. You can update it below if needed.
                </div>
              )}
              <div className="form-group">
                <label>Your Email Address</label>
                <input
                  type="email"
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoFocus
                  required
                />
                <span style={{ fontSize: 12, color: "var(--muted)" }}>
                  Your Secret Santa assignment will be sent here privately — only you will see it. 🤫
                </span>
              </div>
              <button
                className="btn btn-red"
                style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: 16 }}
                disabled={loading}
              >
                {loading ? <span className="spinner" /> : alreadyHasEmail ? "Update my email 🎁" : "Save my email 🎁"}
              </button>
            </>
          )}
        </form>

        <button className="btn btn-ghost btn-sm" style={{ marginTop: 12, width: "100%", justifyContent: "center" }} onClick={reset}>
          ← Back
        </button>
      </div>
    </div>
  );
}
