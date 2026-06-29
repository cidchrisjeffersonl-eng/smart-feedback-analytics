import pool from "../config/db";

export const CourseModel = {
  async findByFaculty(facultyId: string) {
    const result = await pool.query(
      `SELECT * FROM courses WHERE faculty_id = $1 ORDER BY created_at DESC`,
      [facultyId],
    );
    return result.rows;
  },

  async findAll() {
    const result = await pool.query(
      `SELECT c.*, u.full_name AS faculty_name
       FROM courses c
       JOIN faculty f ON c.faculty_id = f.id
       JOIN users u ON f.user_id = u.id
       ORDER BY c.created_at DESC`,
    );
    return result.rows;
  },

  async create(
    faculty_id: string,
    course_code: string,
    course_name: string,
    semester?: string,
    academic_year?: string,
  ) {
    const result = await pool.query(
      `INSERT INTO courses (faculty_id, course_code, course_name, semester, academic_year)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [faculty_id, course_code, course_name, semester, academic_year],
    );
    return result.rows[0];
  },

  async update(
    id: string,
    course_code: string,
    course_name: string,
    semester?: string,
    academic_year?: string,
  ) {
    const result = await pool.query(
      `UPDATE courses SET course_code = $1, course_name = $2, semester = $3, academic_year = $4
       WHERE id = $5 RETURNING *`,
      [course_code, course_name, semester, academic_year, id],
    );
    return result.rows[0];
  },

  async remove(id: string) {
    await pool.query(`DELETE FROM courses WHERE id = $1`, [id]);
  },
};
