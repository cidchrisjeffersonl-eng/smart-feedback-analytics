import { Router } from "express";
import { EvaluationPeriodController } from "../controllers/evaluationPeriod.controller";
import { requireAuth, requireRole } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validate.middleware";
import {
  createPeriodSchema,
  setActiveSchema,
} from "../validators/evaluationPeriod.validator";

const router = Router();

router.get("/", EvaluationPeriodController.getAll);
router.post(
  "/",
  requireAuth,
  requireRole("admin", "academic_lead"),
  validateBody(createPeriodSchema),
  EvaluationPeriodController.create,
);
router.patch(
  "/:id/active",
  requireAuth,
  requireRole("admin", "academic_lead"),
  validateBody(setActiveSchema),
  EvaluationPeriodController.setActive,
);
router.delete(
  "/:id",
  requireAuth,
  requireRole("admin", "academic_lead"),
  EvaluationPeriodController.remove,
);

export default router;
