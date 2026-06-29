import { useEffect, useState } from "react";
import api from "../services/api";
import { useToast } from "../context/ToastContext.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import Spinner from "../components/Spinner.jsx";

const ROLES = ["student", "faculty", "admin", "academic_lead"];

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState(null);
  const showToast = useToast();
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/users");
      setUsers(data);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleRoleChange(id, role) {
    try {
      await api.patch(`/admin/users/${id}/role`, { role });
      showToast("Role updated", "success");
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update role", "error");
    }
  }

  async function confirmDelete() {
    const id = pendingDelete;
    setPendingDelete(null);
    try {
      await api.delete(`/admin/users/${id}`);
      showToast("User deleted", "success");
      load();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete user", "error");
    }
  }

  return (
    <div className="dashboard user-management">
      <h1>User Management</h1>

      {loading ? (
        <Spinner />
      ) : (
        <table className="overview-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th></th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.full_name}</td>
                <td>{u.email}</td>
                <td>
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    disabled={u.id === currentUser?.id}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </td>
                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                <td>
                  {u.id !== currentUser?.id && (
                    <button className="danger-btn" onClick={() => setPendingDelete(u.id)}>Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <ConfirmModal
        open={!!pendingDelete}
        title="Delete user?"
        message="This will permanently remove the user account. This cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}