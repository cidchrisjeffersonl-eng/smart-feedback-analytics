import pool from "../config/db";

export const InterventionModel = {
  async getFacultyStatsForCheck(facultyId: string) {
    const totalsResult = await pool.query(
      `SELECT
         ROUND(AVG(rating)::numeric, 2) AS avg_rating,
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE sentiment_label = 'negative') AS negative_count
       FROM feedback
       WHERE faculty_id = $1`,
      [facultyId],
    );

    const themesResult = await pool.query(
      `SELECT theme, COUNT(*) AS count
       FROM feedback, UNNEST(themes) AS theme
       WHERE faculty_id = $1 AND sentiment_label = 'negative'
       GROUP BY theme
       ORDER BY count DESC
       LIMIT 3`,
      [facultyId],
    );

    const commentsResult = await pool.query(
      `SELECT comment FROM feedback
       WHERE faculty_id = $1 AND sentiment_label = 'negative' AND comment IS NOT NULL AND comment != ''
       ORDER BY created_at DESC LIMIT 5`,
      [facultyId],
    );

    const row = totalsResult.rows[0];
    return {
      avgRating: row.avg_rating !== null ? Number(row.avg_rating) : null,
      totalFeedback: Number(row.total),
      negativeCount: Number(row.negative_count),
      topNegativeThemes: themesResult.rows.map((r) => r.theme),
      sampleNegativeComments: commentsResult.rows.map((r) => r.comment),
    };
  },

  async findOpenForFaculty(facultyId: string) {
    const result = await pool.query(
      `SELECT * FROM interventions
       WHERE faculty_id = $1 AND status IN ('pending', 'in_progress')
       ORDER BY created_at DESC LIMIT 1`,
      [facultyId],
    );
    return result.rows[0] || null;
  },

  async create(facultyId: string, reason: string, suggestedAction: string) {
    const result = await pool.query(
      `INSERT INTO interventions (faculty_id, trigger_reason, suggested_action, status)
       VALUES ($1, $2, $3, 'pending') RETURNING *`,
      [facultyId, reason, suggestedAction],
    );
    return result.rows[0];
  },

  async findAll() {
    const result = await pool.query(
      `SELECT i.*, u.full_name AS faculty_name
       FROM interventions i
       JOIN faculty f ON i.faculty_id = f.id
       JOIN users u ON f.user_id = u.id
       ORDER BY i.created_at DESC`,
    );
    return result.rows;
  },

  async findByFaculty(facultyId: string) {
    const result = await pool.query(
      `SELECT * FROM interventions WHERE faculty_id = $1 ORDER BY created_at DESC`,
      [facultyId],
    );
    return result.rows;
  },

  async updateStatus(id: string, status: string, notes?: string) {
    const resolvedAt = status === "resolved" ? "NOW()" : "NULL";
    const result = await pool.query(
      `UPDATE interventions
       SET status = $1, notes = COALESCE($2, notes), resolved_at = ${resolvedAt}
       WHERE id = $3 RETURNING *`,
      [status, notes, id],
    );
    return result.rows[0];
  },
};
