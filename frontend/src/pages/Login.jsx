import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useToast } from "../context/ToastContext.jsx";
import Spinner from "../components/Spinner.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const showToast = useToast();

  async function handleSubmit(e) {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      showToast(`Welcome back, ${data.user.full_name}!`, "success");

      if (data.user.role === "admin" || data.user.role === "academic_lead") {
        navigate("/admin");
      } else if (data.user.role === "student") {
        navigate("/student");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Login failed", "error");
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <h1>Smart Feedback Analytics</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? <Spinner size={16} /> : "Log In"}
        </button>
      </form>
    </div>
  );
}