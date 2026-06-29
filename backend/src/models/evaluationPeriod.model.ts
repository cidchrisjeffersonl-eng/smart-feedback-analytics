import pool from "../config/db";

export const EvaluationPeriodModel = {
  async findAll() {
    const result = await pool.query(
      `SELECT * FROM evaluation_periods ORDER BY start_date DESC`,
    );
    return result.rows;
  },

  async create(title: string, start_date: string, end_date: string) {
    const result = await pool.query(
      `INSERT INTO evaluation_periods (title, start_date, end_date)
       VALUES ($1, $2, $3) RETURNING *`,
      [title, start_date, end_date],
    );
    return result.rows[0];
  },

  async setActive(id: string, is_active: boolean) {
    const result = await pool.query(
      `UPDATE evaluation_periods SET is_active = $1 WHERE id = $2 RETURNING *`,
      [is_active, id],
    );
    return result.rows[0];
  },

  async remove(id: string) {
    await pool.query(`DELETE FROM evaluation_periods WHERE id = $1`, [id]);
  },
};
