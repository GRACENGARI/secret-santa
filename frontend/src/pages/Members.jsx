import { useState, useEffect } from "react";
import api from "../api";

const EMPTY_FORM = { familyId: "", name: "", email: "" };

export default function Members() {
  const [members,  setMembers]  = useState([]);
  const [families, setFamilies] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [editId,   setEditId]   = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");
  const [filter,   setFilter]   = useState("");

  async function load() {
    try {
      const [mr, fr] = await Promise.all([api.getMembers(), api.getFamilies()]);
      setMembers(mr.data);
      setFamilies(fr.data);
    } catch {
      setError("Could not load data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function startEdit(m) {
    setEditId(m.id);
    setForm({ familyId: m.familyId, name: m.name, email: m.email || "" });
    setError(""); setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true); setError(""); setSuccess("");
    try {
      const payload = { familyId: form.familyId, name: form.name, email: form.email };
      if (editId) {
        await api.updateMember(editId, payload);
        setSuccess(`${form.name} updated.`);
      } else {
        await api.addMember(payload);
        setSuccess(`${form.name} added!`);
      }
      setForm(EMPTY_FORM);
      setEditId(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id, name) {
    if (!confirm(`Remove ${name} from the draw?`)) return;
    setError(""); setSuccess("");
    try {
      await api.deleteMember(id);
      setSuccess(`${name} removed.`);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete.");
    }
  }

  const filtered = filter
    ? members.filter(m =>
        m.name.toLowerCase().includes(filter.toLowerCase()) ||
        m.familyName.toLowerCase().includes(filter.toLowerCase())
      )
    : members;

  const grouped = families.map(f => ({
    family: f,
    members: filtered.filter(m => m.familyId === f.id),
  })).filter(g => g.members.length > 0);

  // Progress bar
  const withEmail = members.filter(m => m.email).length;
  const without   = members.length - withEmail;

  return (
    <div>
      <div className="page-header">
        <h1>🧑 Members</h1>
        <span className="badge badge-gray">{members.length} participants</span>
      </div>

      {/* Email collection progress */}
      {members.length > 0 && (
        <div className="card" style={{ marginBottom: 20, padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 6 }}>Email collection progress</div>
              <div style={{ background: "var(--border)", borderRadius: 20, height: 10, overflow: "hidden" }}>
                <div style={{
                  width: `${Math.round((withEmail / members.length) * 100)}%`,
                  background: "var(--green)", height: "100%", borderRadius: 20,
                  transition: "width 0.3s"
                }} />
              </div>
            </div>
            <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
              <span style={{ color: "var(--green)", fontWeight: 700 }}>{withEmail}</span>
              <span style={{ color: "var(--muted)" }}> / {members.length} done</span>
              {without > 0 && (
                <div style={{ fontSize: 12, color: "var(--red)" }}>{without} still need email</div>
              )}
            </div>
          </div>
        </div>
      )}

      {error   && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {families.length === 0 && (
        <div className="alert alert-info">Add families first before adding members.</div>
      )}

      {/* Add / Edit form */}
      {families.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, marginBottom: 16 }}>
            {editId ? "Edit Member" : "Add a Member"}
          </h2>
          <form onSubmit={handleSave}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="form-group">
                <label>Family</label>
                <select
                  value={form.familyId}
                  onChange={e => setForm(f => ({ ...f, familyId: e.target.value }))}
                  required
                >
                  <option value="">— Select family —</option>
                  {families.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  placeholder="e.g. James Ndegwa"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Email Address <span style={{ color: "var(--muted)", fontWeight: 400 }}>(optional — they can add it themselves via the link)</span></label>
              <input
                type="email"
                placeholder="their email address"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-red" disabled={saving}>
                {saving ? <span className="spinner" /> : editId ? "💾 Save Changes" : "+ Add Member"}
              </button>
              {editId && (
                <button type="button" className="btn btn-ghost" onClick={cancelEdit}>Cancel</button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Filter */}
      {members.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <input
            style={{ padding: "9px 12px", border: "1px solid var(--border)", borderRadius: 7, fontSize: 14, width: "100%", maxWidth: 320 }}
            placeholder="🔍 Filter by name or family..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
        </div>
      )}

      {/* Members list grouped by family */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 32 }}><span className="spinner" /></div>
      ) : members.length === 0 ? (
        <div className="card">
          <div className="empty">
            <div className="empty-icon">🧑</div>
            <p>No members yet. Add people using the form above.</p>
          </div>
        </div>
      ) : grouped.length === 0 ? (
        <div className="card">
          <div className="empty"><p>No results for "{filter}".</p></div>
        </div>
      ) : (
        grouped.map(({ family, members: fMembers }) => (
          <div key={family.id} className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, marginBottom: 12, color: "var(--red)" }}>
              👨‍👩‍👧 {family.name}
              <span className="badge badge-gray" style={{ marginLeft: 8 }}>{fMembers.length}</span>
            </h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {fMembers.map(m => (
                    <tr key={m.id}>
                      <td><strong>{m.name}</strong></td>
                      <td style={{ color: "var(--muted)", fontSize: 13 }}>{m.email || "—"}</td>
                      <td>
                        {m.email
                          ? <span className="badge badge-green">✅ Email added</span>
                          : <span className="badge badge-red">⏳ Pending</span>
                        }
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button className="btn btn-ghost btn-sm" style={{ marginRight: 6 }} onClick={() => startEdit(m)}>✏️ Edit</button>
                        <button className="btn btn-ghost btn-sm" style={{ color: "var(--red)" }} onClick={() => handleDelete(m.id, m.name)}>🗑 Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
