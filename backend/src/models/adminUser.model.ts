import pool from "../config/db";

export const AdminUserModel = {
  async findAll() {
    const result = await pool.query(
      `SELECT id, full_name, email, role, created_at FROM users ORDER BY created_at DESC`,
    );
    return result.rows;
  },

  async updateRole(id: string, role: string) {
    const result = await pool.query(
      `UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2
       RETURNING id, full_name, email, role, created_at`,
      [role, id],
    );
    return result.rows[0];
  },

  async remove(id: string) {
    await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
  },
};
