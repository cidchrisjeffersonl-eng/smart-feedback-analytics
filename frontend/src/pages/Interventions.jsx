import { useEffect, useState } from "react";
import api from "../services/api";
import { useToast } from "../context/ToastContext.jsx";
import Spinner from "../components/Spinner.jsx";

const STATUS_OPTIONS = ["pending", "in_progress", "resolved", "dismissed"];

export default function Interventions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noteDrafts, setNoteDrafts] = useState({});
  const showToast = useToast();

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/interventions");
      setItems(data);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to load interventions", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleStatusChange(id, status) {
    try {
      await api.patch(`/interventions/${id}`, { status, notes: noteDrafts[id] });
      showToast("Intervention updated", "success");
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update intervention", "error");
    }
  }

  return (
    <div className="dashboard interventions-page">
      <h1>Faculty Interventions</h1>
      <p className="muted">
        Automatically flagged when a faculty member's ratings drop or negative feedback spikes.
        Suggested actions are AI-generated when available, with a rule-based fallback.
      </p>

      {loading ? (
        <Spinner />
      ) : items.length === 0 ? (
        <p className="muted">No interventions flagged. Everything looks healthy.</p>
      ) : (
        <ul className="intervention-list">
          {items.map((item) => (
            <li key={item.id} className={`intervention-item status-${item.status}`}>
              <div className="intervention-header">
                <strong>{item.faculty_name}</strong>
                <span className={`badge status-badge-${item.status}`}>{item.status.replace("_", " ")}</span>
              </div>
              <p className="intervention-reason"><em>Trigger:</em> {item.trigger_reason}</p>
              <p className="intervention-action"><em>Suggested action:</em> {item.suggested_action}</p>
              <textarea
                placeholder="Add notes about action taken..."
                defaultValue={item.notes || ""}
                onChange={(e) => setNoteDrafts({ ...noteDrafts, [item.id]: e.target.value })}
                rows={2}
              />
              <div className="intervention-actions">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    className={s === item.status ? "active-status-btn" : ""}
                    onClick={() => handleStatusChange(item.id, s)}
                  >
                    {s.replace("_", " ")}
                  </button>
                ))}
              </div>
              <span className="timestamp">Flagged {new Date(item.created_at).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}