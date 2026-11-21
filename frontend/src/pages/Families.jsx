import { useState, useEffect } from "react";
import api from "../api";

export default function Families() {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [newName, setNewName]   = useState("");
  const [adding, setAdding]     = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");

  async function load() {
    try {
      const r = await api.getFamilies();
      setFamilies(r.data);
    } catch {
      setError("Could not load families.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    setError(""); setSuccess("");
    try {
      await api.addFamily(newName.trim());
      setNewName("");
      setSuccess(`Family "${newName.trim()}" added!`);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add family.");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id, name) {
    if (!confirm(`Delete the "${name}" family and all its members?`)) return;
    setError(""); setSuccess("");
    try {
      await api.deleteFamily(id);
      setSuccess(`"${name}" deleted.`);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete family.");
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>👨‍👩‍👧 Families</h1>
        <span className="badge badge-gray">{families.length} families</span>
      </div>

      {error   && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Add family form */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, marginBottom: 16 }}>Add a Family</h2>
        <form onSubmit={handleAdd} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            style={{ flex: 1, minWidth: 200, padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 7, fontSize: 15 }}
            placeholder="e.g. The Johnsons"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            required
          />
          <button className="btn btn-red" disabled={adding}>
            {adding ? <span className="spinner" /> : "+ Add Family"}
          </button>
        </form>
      </div>

      {/* Family list */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: "center", padding: 32 }}><span className="spinner" /></div>
        ) : families.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">👨‍👩‍👧</div>
            <p>No families yet. Add the first one above.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Family Name</th>
                  <th>Members</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {families.map(f => (
                  <tr key={f.id}>
                    <td><strong>{f.name}</strong></td>
                    <td>
                      <span className="badge badge-green">{f.memberCount} member{f.memberCount !== 1 ? "s" : ""}</span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: "var(--red)" }}
                        onClick={() => handleDelete(f.id, f.name)}
                      >
                        🗑 Delete
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
