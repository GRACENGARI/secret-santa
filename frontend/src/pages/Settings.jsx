import { useState, useEffect } from "react";
import api from "../api";

export default function Settings() {
  const [meetupDate,     setMeetupDate]     = useState("");
  const [adminPassword,  setAdminPassword]  = useState("");
  const [confirmPw,      setConfirmPw]      = useState("");
  const [testEmail,      setTestEmail]      = useState("");
  const [saving,         setSaving]         = useState(false);
  const [testing,        setTesting]        = useState(false);
  const [error,          setError]          = useState("");
  const [success,        setSuccess]        = useState("");

  useEffect(() => {
    api.getStatus().then(r => {
      if (r.data.meetupDate) {
        setMeetupDate(r.data.meetupDate.slice(0, 10));
      } else {
        setMeetupDate("2026-11-28");
      }
    });
  }, []);

  async function handleSaveDate(e) {
    e.preventDefault();
    setSaving(true); setError(""); setSuccess("");
    try {
      await api.saveSettings({ meetupDate });
      setSuccess("Meetup date saved! Reminders will be sent automatically.");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    if (adminPassword !== confirmPw) {
      setError("Passwords do not match.");
      return;
    }
    if (adminPassword.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }
    setSaving(true); setError(""); setSuccess("");
    try {
      await api.saveSettings({ adminPassword });
      sessionStorage.setItem("adminPassword", adminPassword);
      setAdminPassword(""); setConfirmPw("");
      setSuccess("Password changed successfully.");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to change password.");
    } finally {
      setSaving(false);
    }
  }

  async function handleTestEmail(e) {
    e.preventDefault();
    setTesting(true); setError(""); setSuccess("");
    try {
      const r = await api.testEmail(testEmail);
      setSuccess(r.data.message);
    } catch (err) {
      setError(err.response?.data?.error || "Test email failed. Check your Gmail settings in .env");
    } finally {
      setTesting(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>⚙️ Settings</h1>
      </div>

      {error   && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Meetup date */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 17, marginBottom: 4 }}>🗓️ Family Meetup Date</h2>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>
          Set the date of your family gathering. Reminder emails will go out automatically at 6 weeks, 2 weeks, and 3 days before.
        </p>
        <form onSubmit={handleSaveDate} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label>Meetup Date</label>
            <input
              type="date"
              value={meetupDate}
              onChange={e => setMeetupDate(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-green" disabled={saving}>
            {saving ? <span className="spinner" /> : "💾 Save Date"}
          </button>
        </form>
      </div>

      {/* Test email */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 17, marginBottom: 4 }}>📧 Test Email</h2>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>
          Send a test assignment email to verify your Gmail setup is working before running the real draw.
        </p>
        <form onSubmit={handleTestEmail} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label>Your Email</label>
            <input
              type="email"
              placeholder="you@gmail.com"
              value={testEmail}
              onChange={e => setTestEmail(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-gold" disabled={testing}>
            {testing ? <span className="spinner" /> : "📨 Send Test"}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="card">
        <h2 style={{ fontSize: 17, marginBottom: 4 }}>🔐 Change Admin Password</h2>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>
          Change the password used to access this admin panel.
        </p>
        <form onSubmit={handleChangePassword}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                placeholder="Min 4 characters"
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Repeat password"
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                required
              />
            </div>
          </div>
          <button className="btn btn-red" disabled={saving}>
            {saving ? <span className="spinner" /> : "🔐 Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
