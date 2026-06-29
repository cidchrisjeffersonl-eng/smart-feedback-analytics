import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/dashboard" className="navbar-brand">Smart Feedback Analytics</Link>
      </div>
      <div className="navbar-right">
        {user.role === "student" && <Link to="/student">My Feedback</Link>}
        {user.role === "student" && <Link to="/feedback">Give Feedback</Link>}
        {user.role === "faculty" && <Link to="/dashboard">My Dashboard</Link>}
        {user.role === "faculty" && <Link to="/my-interventions">My Feedback Flags</Link>}
        {(user.role === "admin" || user.role === "academic_lead") && (
          <>
            <Link to="/admin">Overview</Link>
            <Link to="/admin/manage">Manage</Link>
            <Link to="/admin/interventions">Interventions</Link>
            {user.role === "admin" && <Link to="/admin/users">Users</Link>}
          </>
        )}
        <span className="navbar-user">{user.full_name} ({user.role})</span>
        <button onClick={handleLogout} className="logout-btn">Log Out</button>
      </div>
    </nav>
  );
}