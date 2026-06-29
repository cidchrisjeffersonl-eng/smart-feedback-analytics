import pool from "../config/db";

export const AnalyticsSnapshotModel = {
  async get(facultyId: string, periodId: string) {
    const result = await pool.query(
      `SELECT * FROM analytics_snapshots WHERE faculty_id = $1 AND evaluation_period_id = $2`,
      [facultyId, periodId],
    );
    return result.rows[0] || null;
  },

  // Recomputes live aggregates for this faculty+period and upserts the cached snapshot.
  // Called after every feedback submission so the cache never goes stale.
  async refresh(facultyId: string, periodId: string) {
    const statsResult = await pool.query(
      `SELECT
         ROUND(AVG(rating)::numeric, 2) AS avg_rating,
         COUNT(*) FILTER (WHERE sentiment_label = 'positive') AS positive_count,
         COUNT(*) FILTER (WHERE sentiment_label = 'neutral') AS neutral_count,
         COUNT(*) FILTER (WHERE sentiment_label = 'negative') AS negative_count
       FROM feedback
       WHERE faculty_id = $1 AND evaluation_period_id = $2`,
      [facultyId, periodId],
    );

    const themesResult = await pool.query(
      `SELECT theme, COUNT(*) AS count
       FROM feedback, UNNEST(themes) AS theme
       WHERE faculty_id = $1 AND evaluation_period_id = $2
       GROUP BY theme ORDER BY count DESC LIMIT 5`,
      [facultyId, periodId],
    );

    const stats = statsResult.rows[0];
    const topThemes = themesResult.rows;

    const result = await pool.query(
      `INSERT INTO analytics_snapshots
        (faculty_id, evaluation_period_id, avg_rating, positive_count, neutral_count, negative_count, top_themes, generated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT (faculty_id, evaluation_period_id)
       DO UPDATE SET
         avg_rating = EXCLUDED.avg_rating,
         positive_count = EXCLUDED.positive_count,
         neutral_count = EXCLUDED.neutral_count,
         negative_count = EXCLUDED.negative_count,
         top_themes = EXCLUDED.top_themes,
         generated_at = NOW()
       RETURNING *`,
      [
        facultyId,
        periodId,
        stats.avg_rating,
        stats.positive_count,
        stats.neutral_count,
        stats.negative_count,
        JSON.stringify(topThemes),
      ],
    );
    return result.rows[0];
  },
};
