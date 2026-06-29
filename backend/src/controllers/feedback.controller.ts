import { Request, Response } from "express";
import { FeedbackModel } from "../models/feedback.model";
import { analyzeFeedback } from "../services/sentiment.service";
import { evaluateForIntervention } from "../services/intervention.service";
import { InterventionModel } from "../models/intervention.model";
import { AnalyticsSnapshotModel } from "../models/analyticsSnapshot.model";
import { generateAISuggestion } from "../services/ai.service";

// Neutralizes CSV formula injection — if a cell starts with =, +, -, or @,
// Excel/Sheets may interpret it as a formula. Prefixing with a tab character
// forces it to be read as plain text instead.
function sanitizeCsvCell(value: string | number): string {
  const str = String(value ?? "");
  if (/^[=+\-@]/.test(str)) {
    return `\t${str}`;
  }
  return str;
}

export const FeedbackController = {
  async submit(req: Request, res: Response) {
    try {
      const {
        student_id,
        faculty_id,
        course_id,
        evaluation_period_id,
        rating,
        comment,
      } = req.body;

      if (!faculty_id || !course_id || !rating) {
        return res
          .status(400)
          .json({ message: "faculty_id, course_id, and rating are required" });
      }

      const analysis = analyzeFeedback(comment || "");

      const feedback = await FeedbackModel.create({
        student_id,
        faculty_id,
        course_id,
        evaluation_period_id,
        rating,
        comment,
        sentiment_label: analysis.label,
        sentiment_score: analysis.score,
        themes: analysis.themes,
      });

      // Refresh the cached analytics snapshot for this faculty+period, if a period was given.
      if (evaluation_period_id) {
        try {
          await AnalyticsSnapshotModel.refresh(
            faculty_id,
            evaluation_period_id,
          );
        } catch (snapErr) {
          console.error("Failed to refresh analytics snapshot:", snapErr);
          // Don't block submission if the cache refresh fails — live queries still work as fallback.
        }
      }

      // Auto-check if this faculty member should be flagged for intervention.
      try {
        const existingOpen =
          await InterventionModel.findOpenForFaculty(faculty_id);
        if (!existingOpen) {
          const stats =
            await InterventionModel.getFacultyStatsForCheck(faculty_id);
          const check = evaluateForIntervention(stats);
          if (check.shouldFlag) {
            let suggestedAction = check.suggestedAction;

            // Try to get a richer, comment-aware suggestion from Claude.
            const facultyName =
              await FeedbackModel.getFacultyNameById(faculty_id);
            const aiSuggestion = await generateAISuggestion({
              facultyName: facultyName || "this faculty member",
              avgRating: stats.avgRating,
              totalFeedback: stats.totalFeedback,
              negativeCount: stats.negativeCount,
              topNegativeThemes: stats.topNegativeThemes,
              sampleNegativeComments: stats.sampleNegativeComments,
            });

            if (aiSuggestion) {
              suggestedAction = aiSuggestion;
            }

            await InterventionModel.create(
              faculty_id,
              check.reason,
              suggestedAction,
            );
          }
        }
      } catch (flagErr) {
        console.error("Intervention check failed:", flagErr);
      }

      res.status(201).json(feedback);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to submit feedback" });
    }
  },

  async getReportHistory(req: Request, res: Response) {
    try {
      const { facultyId } = req.params;
      const reports = await FeedbackModel.getReportsByFaculty(facultyId);
      res.json(reports);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch report history" });
    }
  },

  async getByFaculty(req: Request, res: Response) {
    try {
      const { facultyId } = req.params;
      const { courseId, periodId } = req.query as {
        courseId?: string;
        periodId?: string;
      };
      const feedback = await FeedbackModel.findByFaculty(
        facultyId,
        courseId,
        periodId,
      );
      res.json(feedback);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  },

  async getAnalytics(req: Request, res: Response) {
    try {
      const { facultyId } = req.params;
      const { courseId, periodId } = req.query as {
        courseId?: string;
        periodId?: string;
      };

      // Use the cached snapshot only when a period is specified and there's no course filter
      // (course-filtered views are more granular than what we cache, so they stay live).
      if (periodId && !courseId) {
        const cached = await AnalyticsSnapshotModel.get(facultyId, periodId);
        if (cached) {
          const themeFrequency = (cached.top_themes || []).map((t: any) => ({
            theme: t.theme,
            count: t.count,
          }));
          return res.json({
            sentimentSummary: [
              { sentiment_label: "positive", count: cached.positive_count },
              { sentiment_label: "neutral", count: cached.neutral_count },
              { sentiment_label: "negative", count: cached.negative_count },
            ],
            averageRating: {
              avg_rating: cached.avg_rating,
              total:
                Number(cached.positive_count) +
                Number(cached.neutral_count) +
                Number(cached.negative_count),
            },
            themeFrequency,
            fromCache: true,
          });
        }
      }

      // Fallback: compute live (no period specified, course filter active, or no cache yet).
      const [sentimentSummary, averageRating, themeFrequency] =
        await Promise.all([
          FeedbackModel.getSentimentSummary(facultyId, courseId, periodId),
          FeedbackModel.getAverageRating(facultyId, courseId, periodId),
          FeedbackModel.getThemeFrequency(facultyId, courseId, periodId),
        ]);
      res.json({
        sentimentSummary,
        averageRating,
        themeFrequency,
        fromCache: false,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  },

  async getAdminOverview(_req: Request, res: Response) {
    try {
      const overview = await FeedbackModel.getAdminOverview();
      res.json(overview);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch admin overview" });
    }
  },
  async getByStudent(req: Request, res: Response) {
    try {
      const { studentId } = req.params;
      const feedback = await FeedbackModel.findByStudent(studentId);
      res.json(feedback);
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ message: "Failed to fetch your feedback history" });
    }
  },

  async exportCsv(req: Request, res: Response) {
    try {
      const { facultyId } = req.params;
      const { courseId, periodId } = req.query as {
        courseId?: string;
        periodId?: string;
      };
      const rows = await FeedbackModel.findByFaculty(
        facultyId,
        courseId,
        periodId,
      );

      const header = [
        "Date",
        "Rating",
        "Sentiment",
        "Score",
        "Themes",
        "Comment",
      ];
      const csvRows = rows.map((r: any) => [
        new Date(r.created_at).toISOString(),
        r.rating,
        r.sentiment_label,
        r.sentiment_score,
        sanitizeCsvCell((r.themes || []).join("; ")),
        `"${sanitizeCsvCell(r.comment || "").replace(/"/g, '""')}"`,
      ]);

      const csv = [header.join(","), ...csvRows.map((r) => r.join(","))].join(
        "\n",
      );
      const fileName = `feedback_report_${facultyId}_${Date.now()}.csv`;

      // Log this export to the reports table for audit/history purposes.
      try {
        const requestingUserId = (req as any).user?.id || null;
        await FeedbackModel.logReport(
          facultyId,
          requestingUserId,
          periodId || null,
          fileName,
        );
      } catch (logErr) {
        console.error("Failed to log report generation:", logErr);
        // Don't block the actual export if logging fails.
      }

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`,
      );
      res.send(csv);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to export report" });
    }
  },
};


