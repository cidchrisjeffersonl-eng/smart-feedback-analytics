import { Router } from "express";
import authRoutes from "./auth.routes";
import feedbackRoutes from "./feedback.routes";
import courseRoutes from "./course.routes";
import facultyRoutes from "./faculty.routes";
import evaluationPeriodRoutes from "./evaluationPeriod.routes";
import interventionRoutes from "./intervention.routes";
import adminUserRoutes from "./adminUser.routes";
import departmentRoutes from "./department.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/feedback", feedbackRoutes);
router.use("/courses", courseRoutes);
router.use("/faculty", facultyRoutes);
router.use("/periods", evaluationPeriodRoutes);
router.use("/interventions", interventionRoutes);
router.use("/admin/users", adminUserRoutes);
router.use("/departments", departmentRoutes);

router.get("/health", (_req, res) => res.json({ status: "ok" }));

export default router;
