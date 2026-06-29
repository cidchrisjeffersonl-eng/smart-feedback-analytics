import { useEffect, useState } from "react";
import api from "../services/api";

export default function AdminOverview() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOverview() {
      try {
        const { data } = await api.get("/feedback/admin/overview");
        setRows(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load overview");
      }
    }
    fetchOverview();
  }, []);

  return (
    <div className="dashboard admin-overview">
      <h1>Faculty Evaluation Overview</h1>
      {error && <p className="error">{error}</p>}
      {rows.length === 0 && !error && <p className="muted">No faculty data yet.</p>}
      {rows.length > 0 && (
        <table className="overview-table">
          <thead>
            <tr>
              <th>Faculty</th>
              <th>Department</th>
              <th>Avg Rating</th>
              <th>Total</th>
              <th>Positive</th>
              <th>Neutral</th>
              <th>Negative</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.faculty_id}>
                <td>{r.full_name}</td>
                <td>{r.department || "—"}</td>
                <td>{r.avg_rating ?? "N/A"}</td>
                <td>{r.total_feedback}</td>
                <td className="positive-cell">{r.positive_count}</td>
                <td className="neutral-cell">{r.neutral_count}</td>
                <td className="negative-cell">{r.negative_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}