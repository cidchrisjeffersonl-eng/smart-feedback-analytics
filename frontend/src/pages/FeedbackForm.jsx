import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useToast } from "../context/ToastContext.jsx";
import Spinner from "../components/Spinner.jsx";

export default function FeedbackForm() {
  const navigate = useNavigate();
  const showToast = useToast();

  const [facultyList, setFacultyList] = useState([]);
  const [courses, setCourses] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [facultyId, setFacultyId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [periodId, setPeriodId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchFaculty() {
      try {
        const { data } = await api.get("/faculty");
        setFacultyList(data);
      } catch (err) {
        console.error("Failed to load faculty list", err);
      }
    }
    fetchFaculty();
  }, []);

  useEffect(() => {
    async function fetchPeriods() {
      try {
        const { data } = await api.get("/periods");
        setPeriods(data);
        const active = data.find((p) => p.is_active);
        if (active) setPeriodId(active.id);
      } catch (err) {
        console.error("Failed to load evaluation periods", err);
      }
    }
    fetchPeriods();
  }, []);

  useEffect(() => {
    setCourseId("");
    setCourses([]);
    if (!facultyId) return;
    async function fetchCourses() {
      try {
        const { data } = await api.get(`/courses/faculty/${facultyId}`);
        setCourses(data);
      } catch (err) {
        console.error("Failed to load courses", err);
      }
    }
    fetchCourses();
  }, [facultyId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (isSubmitting) return; // guard against double-clicks

    if (!facultyId) {
      showToast("Please select a professor.", "error");
      return;
    }
    if (!courseId) {
      showToast("Please select a course.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      await api.post("/feedback", {
        student_id: user?.id || null,
        faculty_id: facultyId,
        course_id: courseId,
        evaluation_period_id: periodId || null,
        rating,
        comment,
      });
      showToast("Feedback submitted — thank you!", "success");
      navigate("/feedback/success", { replace: true });
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to submit feedback.", "error");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="feedback-form">
      <h2>Faculty Feedback</h2>

      <label>
        Professor:
        <select
          value={facultyId}
          onChange={(e) => setFacultyId(e.target.value)}
          required
          disabled={isSubmitting}
        >
          <option value="">Select a professor</option>
          {facultyList.map((f) => (
            <option key={f.faculty_id} value={f.faculty_id}>
              {f.full_name} {f.department ? `— ${f.department}` : ""}
            </option>
          ))}
        </select>
      </label>

      <label>
        Course:
        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          required
          disabled={!facultyId || isSubmitting}
        >
          <option value="">{facultyId ? "Select a course" : "Select a professor first"}</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.course_code} — {c.course_name}</option>
          ))}
        </select>
      </label>

      <label>
        Evaluation Period:
        <select value={periodId} onChange={(e) => setPeriodId(e.target.value)} disabled={isSubmitting}>
          <option value="">No specific period</option>
          {periods.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </label>

      <label>
        Rating (1-5):
        <input
          type="number"
          min={1}
          max={5}
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          disabled={isSubmitting}
        />
      </label>

      <label>
        Comments:
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={5}
          disabled={isSubmitting}
        />
      </label>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? <Spinner size={16} /> : "Submit Feedback"}
      </button>
    </form>
  );
}