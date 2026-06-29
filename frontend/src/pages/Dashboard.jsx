import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import api from "../services/api";

const COLORS = { positive: "#4caf50", neutral: "#ffc107", negative: "#f44336" };

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [feedbackList, setFeedbackList] = useState([]);
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [user] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));
  const [reportHistory, setReportHistory] = useState([]);

  useEffect(() => {
    async function fetchCourses() {
      if (!user?.faculty_id) return;
      try {
        const { data } = await api.get(`/courses/faculty/${user.faculty_id}`);
        setCourses(data);
      } catch (err) {
        console.error("Failed to load courses", err);
      }
    }
    fetchCourses();
  }, [user]);

  useEffect(() => {
    async function fetchData() {
      if (!user?.faculty_id) return;
      try {
        const params = courseId ? { courseId } : {};
        const [analyticsRes, feedbackRes] = await Promise.all([
          api.get(`/feedback/faculty/${user.faculty_id}/analytics`, { params }),
          api.get(`/feedback/faculty/${user.faculty_id}`, { params }),
        ]);
        setAnalytics(analyticsRes.data);
        setFeedbackList(feedbackRes.data);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      }
    }
    fetchData();
  }, [user, courseId]);

  useEffect(() => {
    async function fetchReportHistory() {
      if (!user?.faculty_id) return;
      try {
        const { data } = await api.get(`/feedback/faculty/${user.faculty_id}/reports`);
        setReportHistory(data);
      } catch (err) {
        console.error("Failed to load report history", err);
      }
    }
    fetchReportHistory();
  }, [user]);

  async function handleExport() {
    try {
      const params = courseId ? { courseId } : {};
      const response = await api.get(`/feedback/faculty/${user.faculty_id}/export`, {
        params,
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `feedback_report_${user.faculty_id}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Refresh report history to show this new export.
      const { data } = await api.get(`/feedback/faculty/${user.faculty_id}/reports`);
      setReportHistory(data);
    } catch (err) {
      console.error("Export failed", err);
    } 
    
  }

  const sentimentData =
    analytics?.sentimentSummary.map((row) => ({
      name: row.sentiment_label,
      value: Number(row.count),
    })) || [];

  const themeData =
    analytics?.themeFrequency.map((row) => ({
      theme: row.theme,
      count: Number(row.count),
    })) || [];

  if (!user?.faculty_id) {
    return <div className="dashboard"><p>No faculty profile linked to this account.</p></div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Faculty Evaluation Dashboard</h1>
        <button className="export-btn" onClick={handleExport}>Export CSV</button>
      </div>

      <div className="filters">
        <label>
          Course:
          <select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.course_code} — {c.course_name}</option>
            ))}
          </select>
        </label>
      </div>

      {analytics && (
        <p>
          Average Rating: <strong>{analytics.averageRating.avg_rating ?? "N/A"}</strong> (
          {analytics.averageRating.total} responses)
        </p>
      )}

      <section>
        <h2>Sentiment Breakdown</h2>
        {sentimentData.length === 0 ? (
          <p className="muted">No feedback yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={sentimentData} dataKey="value" nameKey="name" outerRadius={100} label>
                {sentimentData.map((entry) => (
                  <Cell key={entry.name} fill={COLORS[entry.name] || "#999"} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </section>

      <section>
        <h2>Top Themes Detected</h2>
        {themeData.length === 0 ? (
          <p className="muted">No themes detected yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={themeData} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="theme" width={140} />
              <Tooltip />
              <Bar dataKey="count" fill="#4361ee" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>

      <section>
        <h2>Recent Feedback</h2>
        {feedbackList.length === 0 ? (
          <p className="muted">No feedback submitted yet.</p>
        ) : (
          <ul className="feedback-list">
            {feedbackList.map((fb) => (
              <li key={fb.id} className={`feedback-item sentiment-${fb.sentiment_label}`}>
                <div className="feedback-meta">
                  <span className="rating">★ {fb.rating}/5</span>
                  <span className={`badge badge-${fb.sentiment_label}`}>
                    {fb.sentiment_label} ({fb.sentiment_score})
                  </span>
                </div>
                {fb.comment && <p className="feedback-comment">"{fb.comment}"</p>}
                {fb.themes?.length > 0 && (
                  <div className="theme-tags">
                    {fb.themes.map((t) => (
                      <span key={t} className="tag">{t}</span>
                    ))}
                  </div>
                )}
                <span className="timestamp">{new Date(fb.created_at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h2>Report Export History</h2>
        {reportHistory.length === 0 ? (
          <p className="muted">No reports generated yet.</p>
        ) : (
          <ul className="feedback-list">
            {reportHistory.map((r) => (
              <li key={r.id} className="feedback-item">
                <div className="feedback-meta">
                  <span className="rating">{r.file_path}</span>
                </div>
                <span className="timestamp">
                  Generated {new Date(r.created_at).toLocaleString()}
                  {r.generated_by_name ? ` by ${r.generated_by_name}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}