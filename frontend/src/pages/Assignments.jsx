import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [members,     setMembers]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const [ar, mr] = await Promise.all([api.getAssignments(), api.getMembers()]);
        setAssignments(ar.data);
        setMembers(mr.data);
      } catch (err) {
        if (err.response?.status === 401) {
          setError("Not authorised.");
        } else {
          setError(err.response?.data?.error || "Could not load assignments.");
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function openPrintSlip(memberId) {
    window.open(`/print-slip/${memberId}`, "_blank");
  }

  const printNeeded = assignments.filter(a => a.giverNoSmartphone);

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

      {printNeeded.length > 0 && (
        <div className="alert alert-info" style={{ marginBottom: 20 }}>
          🖨 <strong>{printNeeded.length} person{printNeeded.length > 1 ? "s" : ""}</strong> need a printed slip: {printNeeded.map(a => a.giverName).join(", ")}. Click the print button in their row.
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
                  <th>Delivery</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a, i) => {
                  const giverMember = members.find(m => m.name === a.giverName);
                  return (
                    <tr key={i}>
                      <td><strong>{a.giverName}</strong></td>
                      <td><span className="badge badge-gray">{a.giverFamily}</span></td>
                      <td style={{ color: "var(--red)", fontWeight: 600 }}>🎁 {a.receiverName}</td>
                      <td><span className="badge badge-gray">{a.receiverFamily}</span></td>
                      <td>
                        {a.giverNoSmartphone
                          ? <span className="badge badge-gold">🖨 Print slip</span>
                          : <span className="badge badge-green">📧 Emailed</span>
                        }
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {a.giverNoSmartphone && giverMember && (
                          <button
                            className="btn btn-gold btn-sm"
                            onClick={() => openPrintSlip(giverMember.id)}
                          >
                            🖨 Print Slip
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
