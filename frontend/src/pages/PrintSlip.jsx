import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";
import "./PrintSlip.css";

export default function PrintSlip() {
  const { memberId } = useParams();
  const [slip,    setSlip]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    api.getSlip(memberId)
      .then(r => setSlip(r.data))
      .catch(err => setError(err.response?.data?.error || "Could not load slip."))
      .finally(() => setLoading(false));
  }, [memberId]);

  if (loading) return <div style={{ textAlign: "center", padding: 48 }}><span className="spinner" /></div>;
  if (error)   return <div style={{ padding: 32 }}><div className="alert alert-error">{error}</div><Link to="/assignments" className="btn btn-ghost">← Back</Link></div>;

  const dateStr = slip.meetupDate
    ? new Date(slip.meetupDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : "the family meetup";

  return (
    <div className="print-page">
      {/* Toolbar — hidden when printing */}
      <div className="print-toolbar no-print">
        <Link to="/assignments" className="btn btn-ghost btn-sm">← Back to Assignments</Link>
        <button className="btn btn-red" onClick={() => window.print()}>🖨 Print This Slip</button>
      </div>

      {/* The actual slip */}
      <div className="print-slip">
        <div className="slip-header">
          <div className="slip-icon">🎅</div>
          <h1>Secret Santa</h1>
          <p>Family Gift Exchange</p>
        </div>

        <div className="slip-body">
          <p className="slip-greeting">Hey <strong>{slip.giverName}</strong>! 🎉</p>
          <p className="slip-intro">You have been chosen to gift:</p>

          <div className="slip-receiver">
            <div className="slip-receiver-name">{slip.receiverName}</div>
            <div className="slip-receiver-family">{slip.receiverFamily} family</div>
          </div>

          <div className="slip-footer">
            <p>🤫 Keep it a secret until the meetup!</p>
            <p className="slip-date">📅 {dateStr}</p>
          </div>
        </div>

        {/* Tear line */}
        <div className="tear-line no-print">✂ ─────────────────────────────────────</div>
      </div>
    </div>
  );
}
