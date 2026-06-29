import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function StudentDashboard() {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [user] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));

  useEffect(() => {
    async function load() {
      if (!user?.id) return;
      try {
        const { data } = await api.get(`/feedback/student/${user.id}`);
        setHistory(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load your feedback history");
      }
    }
    load();
  }, [user?.id]);

  return (
    <div className="dashboard student-dashboard">
      <div className="dashboard-header">
        <h1>My Feedback History</h1>
        <Link to="/feedback" className="export-btn" style={{ textDecoration: "none" }}>
          + Give New Feedback
        </Link>
      </div>
      {error && <p className="error">{error}</p>}
      {history.length === 0 && !error && (
        <p className="muted">You haven't submitted any feedback yet.</p>
      )}
      <ul className="feedback-list">
        {history.map((fb) => (
          <li key={fb.id} className={`feedback-item sentiment-${fb.sentiment_label}`}>
            <div className="feedback-meta">
              <span className="rating">★ {fb.rating}/5</span>
              <span className={`badge badge-${fb.sentiment_label}`}>{fb.sentiment_label}</span>
            </div>
            <p><strong>{fb.faculty_name}</strong> — {fb.course_code}: {fb.course_name}</p>
            {fb.comment && <p className="feedback-comment">"{fb.comment}"</p>}
            <span className="timestamp">{new Date(fb.created_at).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}