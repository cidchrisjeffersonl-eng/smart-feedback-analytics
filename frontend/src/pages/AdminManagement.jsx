import { useEffect, useState } from "react";
import api from "../services/api";
import { useToast } from "../context/ToastContext.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import Spinner from "../components/Spinner.jsx";

export default function AdminManagement() {
  const [faculty, setFaculty] = useState([]);
  const [courses, setCourses] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState(null); // { type: 'course'|'period'|'department', id }
  const showToast = useToast();

  const [courseForm, setCourseForm] = useState({
    faculty_id: "", course_code: "", course_name: "", semester: "", academic_year: "",
  });
  const [periodForm, setPeriodForm] = useState({ title: "", start_date: "", end_date: "" });
  const [departmentForm, setDepartmentForm] = useState({ name: "" });

  const [savingCourse, setSavingCourse] = useState(false);
  const [savingPeriod, setSavingPeriod] = useState(false);
  const [savingDepartment, setSavingDepartment] = useState(false);

  async function loadAll() {
    setLoading(true);
    try {
      const [facultyRes, coursesRes, periodsRes, departmentsRes] = await Promise.all([
        api.get("/faculty"),
        api.get("/courses"),
        api.get("/periods"),
        api.get("/departments"),
      ]);
      setFaculty(facultyRes.data);
      setCourses(coursesRes.data);
      setPeriods(periodsRes.data);
      setDepartments(departmentsRes.data);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to load management data", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleCreateCourse(e) {
    e.preventDefault();
    setSavingCourse(true);
    try {
      await api.post("/courses", courseForm);
      setCourseForm({ faculty_id: "", course_code: "", course_name: "", semester: "", academic_year: "" });
      showToast("Course added", "success");
      loadAll();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to create course", "error");
    } finally {
      setSavingCourse(false);
    }
  }

  async function handleCreatePeriod(e) {
    e.preventDefault();
    setSavingPeriod(true);
    try {
      await api.post("/periods", periodForm);
      setPeriodForm({ title: "", start_date: "", end_date: "" });
      showToast("Evaluation period added", "success");
      loadAll();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to create evaluation period", "error");
    } finally {
      setSavingPeriod(false);
    }
  }

  async function handleCreateDepartment(e) {
    e.preventDefault();
    setSavingDepartment(true);
    try {
      await api.post("/departments", departmentForm);
      setDepartmentForm({ name: "" });
      showToast("Department added", "success");
      loadAll();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to create department", "error");
    } finally {
      setSavingDepartment(false);
    }
  }

  async function handleToggleActive(id, current) {
    try {
      await api.patch(`/periods/${id}/active`, { is_active: !current });
      showToast("Period updated", "success");
      loadAll();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update period", "error");
    }
  }

  async function confirmDelete() {
    const { type, id } = pendingDelete;
    setPendingDelete(null);
    try {
      if (type === "course") await api.delete(`/courses/${id}`);
      else if (type === "period") await api.delete(`/periods/${id}`);
      else await api.delete(`/departments/${id}`);
      showToast(`${type[0].toUpperCase() + type.slice(1)} deleted`, "success");
      loadAll();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete", "error");
    }
  }

  return (
    <div className="dashboard admin-management">
      <h1>Manage Courses, Periods & Departments</h1>

      {loading ? (
        <Spinner />
      ) : (
        <>
          <section>
            <h2>Departments</h2>
            <form onSubmit={handleCreateDepartment} className="inline-form">
              <input
                placeholder="Department name (e.g. College of Computer Studies)"
                value={departmentForm.name}
                onChange={(e) => setDepartmentForm({ name: e.target.value })}
                required
                disabled={savingDepartment}
              />
              <button type="submit" disabled={savingDepartment}>
                {savingDepartment ? <Spinner size={14} /> : "Add Department"}
              </button>
            </form>

            <table className="overview-table">
              <thead>
                <tr><th>Name</th><th>Faculty Count</th><th></th></tr>
              </thead>
              <tbody>
                {departments.map((d) => (
                  <tr key={d.id}>
                    <td>{d.name}</td>
                    <td>{d.faculty_count}</td>
                    <td>
                      <button className="danger-btn" onClick={() => setPendingDelete({ type: "department", id: d.id })}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section>
            <h2>Courses</h2>
            <form onSubmit={handleCreateCourse} className="inline-form">
              <select
                value={courseForm.faculty_id}
                onChange={(e) => setCourseForm({ ...courseForm, faculty_id: e.target.value })}
                required
                disabled={savingCourse}
              >
                <option value="">Select faculty</option>
                {faculty.map((f) => (
                  <option key={f.faculty_id} value={f.faculty_id}>{f.full_name}</option>
                ))}
              </select>
              <input
                placeholder="Course code (e.g. CS101)"
                value={courseForm.course_code}
                onChange={(e) => setCourseForm({ ...courseForm, course_code: e.target.value })}
                required
                disabled={savingCourse}
              />
              <input
                placeholder="Course name"
                value={courseForm.course_name}
                onChange={(e) => setCourseForm({ ...courseForm, course_name: e.target.value })}
                required
                disabled={savingCourse}
              />
              <input
                placeholder="Semester (e.g. 1st)"
                value={courseForm.semester}
                onChange={(e) => setCourseForm({ ...courseForm, semester: e.target.value })}
                disabled={savingCourse}
              />
              <input
                placeholder="Academic year (e.g. 2025-2026)"
                value={courseForm.academic_year}
                onChange={(e) => setCourseForm({ ...courseForm, academic_year: e.target.value })}
                disabled={savingCourse}
              />
              <button type="submit" disabled={savingCourse}>
                {savingCourse ? <Spinner size={14} /> : "Add Course"}
              </button>
            </form>

            <table className="overview-table">
              <thead>
                <tr><th>Code</th><th>Name</th><th>Faculty</th><th>Semester</th><th>Year</th><th></th></tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.id}>
                    <td>{c.course_code}</td>
                    <td>{c.course_name}</td>
                    <td>{c.faculty_name}</td>
                    <td>{c.semester || "—"}</td>
                    <td>{c.academic_year || "—"}</td>
                    <td>
                      <button className="danger-btn" onClick={() => setPendingDelete({ type: "course", id: c.id })}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section>
            <h2>Evaluation Periods</h2>
            <form onSubmit={handleCreatePeriod} className="inline-form">
              <input
                placeholder="Title (e.g. 1st Sem 2025-2026)"
                value={periodForm.title}
                onChange={(e) => setPeriodForm({ ...periodForm, title: e.target.value })}
                required
                disabled={savingPeriod}
              />
              <input
                type="date"
                value={periodForm.start_date}
                onChange={(e) => setPeriodForm({ ...periodForm, start_date: e.target.value })}
                required
                disabled={savingPeriod}
              />
              <input
                type="date"
                value={periodForm.end_date}
                onChange={(e) => setPeriodForm({ ...periodForm, end_date: e.target.value })}
                required
                disabled={savingPeriod}
              />
              <button type="submit" disabled={savingPeriod}>
                {savingPeriod ? <Spinner size={14} /> : "Add Period"}
              </button>
            </form>

            <table className="overview-table">
              <thead>
                <tr><th>Title</th><th>Start</th><th>End</th><th>Active</th><th></th></tr>
              </thead>
              <tbody>
                {periods.map((p) => (
                  <tr key={p.id}>
                    <td>{p.title}</td>
                    <td>{new Date(p.start_date).toLocaleDateString()}</td>
                    <td>{new Date(p.end_date).toLocaleDateString()}</td>
                    <td>
                      <button className="toggle-btn" onClick={() => handleToggleActive(p.id, p.is_active)}>
                        {p.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td>
                      <button className="danger-btn" onClick={() => setPendingDelete({ type: "period", id: p.id })}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}

      <ConfirmModal
        open={!!pendingDelete}
        title={`Delete this ${pendingDelete?.type}?`}
        message="This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}