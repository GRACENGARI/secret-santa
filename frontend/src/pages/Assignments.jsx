import { useState, useEffect } from "react";
import api from "../api";

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");

  useEffect(() => {
    async function load() {
      try {
        const r = await api.getAssignments();
        setAssignments(r.data);
      } catch (err) {
        setError(err.response?.data?.error || "Could not load assignments.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div style={{ textAlign: "center", padding: 48 }}><span className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <h1>📋 Assignments</h1>
        <span className="badge badge-green">{assignments.length} total</span>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {assignments.length === 0 && !error && (
        <div className="card">
          <div className="empty">
            <div className="empty-icon">🎲</div>
            <p>No assignments yet. Run the draw first.</p>
          </div>
        </div>
      )}

      {assignments.length > 0 && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Giver</th>
                  <th>Giver's Family</th>
                  <th>→ Gifting</th>
                  <th>Receiver's Family</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a, i) => (
                  <tr key={i}>
                    <td><strong>{a.giverName}</strong></td>
                    <td><span className="badge badge-gray">{a.giverFamily}</span></td>
                    <td style={{ color: "var(--red)", fontWeight: 600 }}>🎁 {a.receiverName}</td>
                    <td><span className="badge badge-gray">{a.receiverFamily}</span></td>
                    <td><span className="badge badge-green">📧 Emailed</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
