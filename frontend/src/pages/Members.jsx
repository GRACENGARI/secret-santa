import { useState, useEffect } from "react";
import api from "../api";

const EMPTY_FORM = {
  familyId: "",
  name: "",
  email: "",
  noSmartphone: false,
  isChild: false,
  isParent: false,
  parentId: "",   // id of the parent member whose email to use
};

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

  // Adults in the currently selected family (potential parents)
  // Only members explicitly marked as parents appear in the dropdown
  const potentialParents = members.filter(
    m => m.familyId === form.familyId && m.isParent && m.email && m.id !== editId
  );

  // When family changes, reset parent selection
  function handleFamilyChange(familyId) {
    setForm(f => ({ ...f, familyId, parentId: "", email: "" }));
  }

  // When "this is a child" is toggled
  function handleIsChildChange(checked) {
    setForm(f => ({ ...f, isChild: checked, parentId: "", email: checked ? "" : f.email }));
  }

  // When a parent is selected, auto-fill email from that parent
  function handleParentChange(parentId) {
    const parent = members.find(m => m.id === parentId);
    setForm(f => ({ ...f, parentId, email: parent ? parent.email : "" }));
  }

  function startEdit(m) {
    setEditId(m.id);
    setForm({
      familyId: m.familyId,
      name: m.name,
      email: m.email || "",
      noSmartphone: m.noSmartphone,
      isChild: m.isChild || false,
      isParent: m.isParent || false,
      parentId: m.parentId || "",
    });
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
      const payload = {
        familyId: form.familyId,
        name: form.name,
        email: form.noSmartphone ? null : form.email,
        noSmartphone: form.noSmartphone,
        isChild: form.isChild,
        isParent: form.isParent,
        parentId: form.isChild ? form.parentId : null,
      };

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

  // Helper: get parent name for a child member
  function getParentName(m) {
    if (!m.isChild || !m.parentId) return null;
    const parent = members.find(p => p.id === m.parentId);
    return parent ? parent.name : null;
  }

  return (
    <div>
      <div className="page-header">
        <h1>🧑 Members</h1>
        <span className="badge badge-gray">{members.length} participants</span>
      </div>

      {/* Email collection progress */}
      {members.length > 0 && (() => {
        const withEmail = members.filter(m => m.email || m.noSmartphone).length;
        const without   = members.filter(m => !m.email && !m.noSmartphone).length;
        return (
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
        );
      })()}

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

            {/* Family + Name */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="form-group">
                <label>Family</label>
                <select
                  value={form.familyId}
                  onChange={e => handleFamilyChange(e.target.value)}
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
                  placeholder="e.g. Kevin Osei"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
            </div>

            {/* Is this person a parent? */}
            {!form.isChild && !form.noSmartphone && (
              <div className="form-group">
                <label>
                  <div className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={form.isParent}
                      onChange={e => setForm(f => ({ ...f, isParent: e.target.checked }))}
                    />
                    <span>This is a parent — children in this family can be linked to them</span>
                  </div>
                </label>
              </div>
            )}

            {/* Is this person a child? */}
            <div className="form-group">
              <label>
                <div className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={form.isChild}
                    onChange={e => handleIsChildChange(e.target.checked)}
                    disabled={form.noSmartphone}
                  />
                  <span>This is a child — use a parent's email for their notification</span>
                </div>
              </label>
            </div>

            {/* Parent picker — only shown when isChild is ticked */}
            {form.isChild && (
              <div className="form-group">
                <label>Parent / Guardian</label>
                {potentialParents.length === 0 ? (
                  <div className="alert alert-info" style={{ marginBottom: 0 }}>
                    No adults with email found in this family yet.
                    Add the parent first, then come back to add this child.
                  </div>
                ) : (
                  <>
                    <select
                      value={form.parentId}
                      onChange={e => handleParentChange(e.target.value)}
                      required={form.isChild}
                    >
                      <option value="">— Select parent —</option>
                      {potentialParents.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.email})</option>
                      ))}
                    </select>
                    {form.parentId && (
                      <span style={{ fontSize: 12, color: "var(--green)", marginTop: 4 }}>
                        ✅ Assignment email will go to {potentialParents.find(p => p.id === form.parentId)?.name}
                      </span>
                    )}
                  </>
                )}
              </div>
            )}

            {/* No smartphone toggle — only for non-children */}
            {!form.isChild && (
              <div className="form-group">
                <label>
                  <div className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={form.noSmartphone}
                      onChange={e => setForm(f => ({
                        ...f,
                        noSmartphone: e.target.checked,
                        email: e.target.checked ? "" : f.email,
                      }))}
                    />
                    <span>No smartphone — will get a printed slip instead</span>
                  </div>
                </label>
              </div>
            )}

            {/* Email — shown for adults with smartphones */}
            {!form.isChild && !form.noSmartphone && (
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="their email address"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-red" disabled={saving || (form.isChild && potentialParents.length === 0)}>
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
                    <th>Notification</th>
                    <th>Type</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {fMembers.map(m => {
                    const parentName = getParentName(m);
                    return (
                      <tr key={m.id}>
                        <td>
                          <strong>{m.name}</strong>
                          {m.isParent && (
                            <span className="badge badge-green" style={{ marginLeft: 8 }}>👨‍👩‍👧 Parent</span>
                          )}
                          {m.isChild && (
                            <span className="badge badge-gold" style={{ marginLeft: 8 }}>👶 Child</span>
                          )}
                        </td>
                        <td style={{ color: "var(--muted)", fontSize: 13 }}>
                          {m.noSmartphone
                            ? "—"
                            : parentName
                            ? <span>via <strong>{parentName}</strong></span>
                            : m.email || "—"
                          }
                        </td>
                        <td>
                          {m.noSmartphone
                            ? <span className="badge badge-gold">🖨 Print slip</span>
                            : m.isChild
                            ? <span className="badge badge-gold">👶 Via parent</span>
                            : <span className="badge badge-green">📧 Email</span>
                          }
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button className="btn btn-ghost btn-sm" style={{ marginRight: 6 }} onClick={() => startEdit(m)}>✏️ Edit</button>
                          <button className="btn btn-ghost btn-sm" style={{ color: "var(--red)" }} onClick={() => handleDelete(m.id, m.name)}>🗑 Remove</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
