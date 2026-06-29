import pool from "../config/db";

export const FacultyModel = {
  async findAll() {
    const result = await pool.query(
      `SELECT f.id AS faculty_id, u.full_name, f.position, d.name AS department
       FROM faculty f
       JOIN users u ON f.user_id = u.id
       LEFT JOIN departments d ON f.department_id = d.id
       ORDER BY u.full_name ASC`,
    );
    return result.rows;
  },
};
