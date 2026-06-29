import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Homepage from "./pages/Homepage.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import FeedbackForm from "./pages/FeedbackForm.jsx";
import FeedbackSuccess from "./pages/FeedbackSuccess.jsx";
import AdminOverview from "./pages/AdminOverview.jsx";
import AdminManagement from "./pages/AdminManagement.jsx";
import UserManagement from "./pages/UserManagement.jsx";
import Interventions from "./pages/Interventions.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import MyInterventions from "./pages/MyInterventions.jsx";
import NotFound from "./pages/NotFound.jsx";

function AppNavbar() {
  const location = useLocation(); // subscribing to this forces a re-render on every navigation
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user) return null;
  return <Navbar key={location.pathname} />;
}

function App() {
  return (
    <>
      <AppNavbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/feedback" element={<FeedbackForm />} />
        <Route path="/feedback/success" element={<FeedbackSuccess />} />
        <Route path="/admin" element={<AdminOverview />} />
        <Route path="/admin/manage" element={<AdminManagement />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/interventions" element={<Interventions />} />
        <Route path="/my-interventions" element={<MyInterventions />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;