import pool from "../config/db";
import { Feedback } from "../types";

export const FeedbackModel = {
  async create(data: Partial<Feedback>) {
    const {
      student_id,
      faculty_id,
      course_id,
      evaluation_period_id,
      rating,
      comment,
      sentiment_label,
      sentiment_score,
      themes,
    } = data;
    const result = await pool.query(
      `INSERT INTO feedback
        (student_id, faculty_id, course_id, evaluation_period_id, rating, comment, sentiment_label, sentiment_score, themes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        student_id,
        faculty_id,
        course_id,
        evaluation_period_id,
        rating,
        comment,
        sentiment_label,
        sentiment_score,
        themes,
      ],
    );
    return result.rows[0];
  },

  async logReport(
    facultyId: string,
    generatedBy: string | null,
    evaluationPeriodId: string | null,
    filePath: string,
  ) {
    const result = await pool.query(
      `INSERT INTO reports (faculty_id, generated_by, evaluation_period_id, file_path)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [facultyId, generatedBy, evaluationPeriodId, filePath],
    );
    return result.rows[0];
  },

  async getReportsByFaculty(facultyId: string) {
    const result = await pool.query(
      `SELECT r.*, u.full_name AS generated_by_name
       FROM reports r
       LEFT JOIN users u ON r.generated_by = u.id
       WHERE r.faculty_id = $1
       ORDER BY r.created_at DESC`,
      [facultyId],
    );
    return result.rows;
  },
  
  async findByStudent(studentId: string) {
    const result = await pool.query(
      `SELECT fb.*, c.course_name, c.course_code, u.full_name AS faculty_name
       FROM feedback fb
       JOIN courses c ON fb.course_id = c.id
       JOIN faculty f ON fb.faculty_id = f.id
       JOIN users u ON f.user_id = u.id
       WHERE fb.student_id = $1
       ORDER BY fb.created_at DESC`,
      [studentId],
    );
    return result.rows;
  },

  async getFacultyNameById(facultyId: string) {
    const result = await pool.query(
      `SELECT u.full_name FROM faculty f JOIN users u ON f.user_id = u.id WHERE f.id = $1`,
      [facultyId],
    );
    return result.rows[0]?.full_name || null;
  },

  async findByFaculty(facultyId: string, courseId?: string, periodId?: string) {
    const conditions = ["faculty_id = $1"];
    const params: string[] = [facultyId];

    if (courseId) {
      params.push(courseId);
      conditions.push(`course_id = $${params.length}`);
    }
    if (periodId) {
      params.push(periodId);
      conditions.push(`evaluation_period_id = $${params.length}`);
    }

    const result = await pool.query(
      `SELECT * FROM feedback WHERE ${conditions.join(" AND ")} ORDER BY created_at DESC`,
      params,
    );
    return result.rows;
  },

  async findByCourse(courseId: string) {
    const result = await pool.query(
      `SELECT * FROM feedback WHERE course_id = $1 ORDER BY created_at DESC`,
      [courseId],
    );
    return result.rows;
  },

  async getSentimentSummary(
    facultyId: string,
    courseId?: string,
    periodId?: string,
  ) {
    const conditions = ["faculty_id = $1"];
    const params: string[] = [facultyId];
    if (courseId) {
      params.push(courseId);
      conditions.push(`course_id = $${params.length}`);
    }
    if (periodId) {
      params.push(periodId);
      conditions.push(`evaluation_period_id = $${params.length}`);
    }

    const result = await pool.query(
      `SELECT sentiment_label, COUNT(*) AS count
       FROM feedback WHERE ${conditions.join(" AND ")}
       GROUP BY sentiment_label`,
      params,
    );
    return result.rows;
  },

  async getAverageRating(
    facultyId: string,
    courseId?: string,
    periodId?: string,
  ) {
    const conditions = ["faculty_id = $1"];
    const params: string[] = [facultyId];
    if (courseId) {
      params.push(courseId);
      conditions.push(`course_id = $${params.length}`);
    }
    if (periodId) {
      params.push(periodId);
      conditions.push(`evaluation_period_id = $${params.length}`);
    }

    const result = await pool.query(
      `SELECT ROUND(AVG(rating)::numeric, 2) AS avg_rating, COUNT(*) AS total
       FROM feedback WHERE ${conditions.join(" AND ")}`,
      params,
    );
    return result.rows[0];
  },

  async getThemeFrequency(
    facultyId: string,
    courseId?: string,
    periodId?: string,
  ) {
    const conditions = ["faculty_id = $1"];
    const params: string[] = [facultyId];
    if (courseId) {
      params.push(courseId);
      conditions.push(`course_id = $${params.length}`);
    }
    if (periodId) {
      params.push(periodId);
      conditions.push(`evaluation_period_id = $${params.length}`);
    }

    const result = await pool.query(
      `SELECT theme, COUNT(*) AS count
       FROM feedback, UNNEST(themes) AS theme
       WHERE ${conditions.join(" AND ")}
       GROUP BY theme
       ORDER BY count DESC`,
      params,
    );
    return result.rows;
  },

  async getAdminOverview() {
    const result = await pool.query(
      `SELECT
         f.id AS faculty_id,
         u.full_name,
         d.name AS department,
         ROUND(AVG(fb.rating)::numeric, 2) AS avg_rating,
         COUNT(fb.id) AS total_feedback,
         COUNT(*) FILTER (WHERE fb.sentiment_label = 'positive') AS positive_count,
         COUNT(*) FILTER (WHERE fb.sentiment_label = 'neutral') AS neutral_count,
         COUNT(*) FILTER (WHERE fb.sentiment_label = 'negative') AS negative_count
       FROM faculty f
       JOIN users u ON f.user_id = u.id
       LEFT JOIN departments d ON f.department_id = d.id
       LEFT JOIN feedback fb ON fb.faculty_id = f.id
       GROUP BY f.id, u.full_name, d.name
       ORDER BY avg_rating DESC NULLS LAST`,
    );
    return result.rows;
  },
};
