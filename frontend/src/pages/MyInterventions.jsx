import { useEffect, useState } from "react";
import api from "../services/api";
import { useToast } from "../context/ToastContext.jsx";
import Spinner from "../components/Spinner.jsx";

export default function MyInterventions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const showToast = useToast();
  const [user] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));

  useEffect(() => {
    async function load() {
      if (!user?.faculty_id) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get(`/interventions/faculty/${user.faculty_id}`);
        setItems(data);
      } catch (err) {
        showToast(err.response?.data?.message || "Failed to load your feedback flags", "error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.faculty_id]);

  return (
    <div className="dashboard interventions-page">
      <h1>My Feedback Flags</h1>
      <p className="muted">
        These are areas flagged from your student feedback trends, along with suggested next steps.
        This is meant to support your growth, not penalize you.
      </p>

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <p className="muted">No flags on your record. Keep up the great work!</p>
      ) : (
        <ul className="intervention-list">
          {items.map((item) => (
            <li key={item.id} className={`intervention-item status-${item.status}`}>
              <div className="intervention-header">
                <strong>Feedback Trend Alert</strong>
                <span className={`badge status-badge-${item.status}`}>{item.status.replace("_", " ")}</span>
              </div>
              <p className="intervention-reason"><em>What triggered this:</em> {item.trigger_reason}</p>
              <p className="intervention-action"><em>Suggested next step:</em> {item.suggested_action}</p>
              <span className="timestamp">Flagged {new Date(item.created_at).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}