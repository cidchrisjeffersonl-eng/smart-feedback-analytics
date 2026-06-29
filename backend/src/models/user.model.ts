import pool from "../config/db";

export const UserModel = {
  async findByEmail(email: string) {
    const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [
      email,
    ]);
    return result.rows[0];
  },

  async findById(id: string) {
    const result = await pool.query(
      `SELECT id, full_name, email, role, created_at FROM users WHERE id = $1`,
      [id],
    );
    return result.rows[0];
  },

  async create(
    full_name: string,
    email: string,
    password_hash: string,
    role: string,
  ) {
    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1,$2,$3,$4)
       RETURNING id, full_name, email, role, created_at`,
      [full_name, email, password_hash, role],
    );
    return result.rows[0];
  },
  async findFacultyIdByUserId(userId: string) {
    const result = await pool.query(
      `SELECT id FROM faculty WHERE user_id = $1`,
      [userId],
    );
    return result.rows[0]?.id || null;
  },
};
