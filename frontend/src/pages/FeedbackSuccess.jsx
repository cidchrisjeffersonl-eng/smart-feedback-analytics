import { Link } from "react-router-dom";

export default function FeedbackSuccess() {
  return (
    <div className="auth-container feedback-success">
      <h2>✅ Feedback Submitted</h2>
      <p>Thank you for helping improve faculty teaching quality.</p>
      <div className="success-actions">
        <Link to="/feedback" className="export-btn" style={{ textDecoration: "none" }}>
          Submit Another
        </Link>
        <Link to="/student" style={{ textDecoration: "none" }}>
          View My Feedback History
        </Link>
      </div>
    </div>
  );
}