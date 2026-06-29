import pool from "../config/db";

export const DepartmentModel = {
  async findAll() {
    const result = await pool.query(
      `SELECT d.*, COUNT(f.id) AS faculty_count
       FROM departments d
       LEFT JOIN faculty f ON f.department_id = d.id
       GROUP BY d.id
       ORDER BY d.name ASC`,
    );
    return result.rows;
  },

  async create(name: string) {
    const result = await pool.query(
      `INSERT INTO departments (name) VALUES ($1) RETURNING *`,
      [name],
    );
    return result.rows[0];
  },

  async update(id: string, name: string) {
    const result = await pool.query(
      `UPDATE departments SET name = $1 WHERE id = $2 RETURNING *`,
      [name, id],
    );
    return result.rows[0];
  },

  async remove(id: string) {
    await pool.query(`DELETE FROM departments WHERE id = $1`, [id]);
  },
};
