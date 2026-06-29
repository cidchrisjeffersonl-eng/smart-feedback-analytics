import { Router } from "express";
import { FeedbackController } from "../controllers/feedback.controller";
import { requireAuth, requireRole } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validate.middleware";
import { submitFeedbackSchema } from "../validators/feedback.validator";
import { feedbackLimiter } from "../middleware/rateLimit.middleware";

const router = Router();

router.post("/", feedbackLimiter, validateBody(submitFeedbackSchema), FeedbackController.submit);
router.get("/admin/overview", requireAuth, requireRole("admin", "academic_lead"), FeedbackController.getAdminOverview);
router.get("/faculty/:facultyId", requireAuth, FeedbackController.getByFaculty);
router.get("/faculty/:facultyId/analytics", requireAuth, FeedbackController.getAnalytics);
router.get("/faculty/:facultyId/export", requireAuth, FeedbackController.exportCsv);
router.get("/student/:studentId", requireAuth, FeedbackController.getByStudent);
router.get("/faculty/:facultyId/reports", requireAuth, FeedbackController.getReportHistory);

export default router;