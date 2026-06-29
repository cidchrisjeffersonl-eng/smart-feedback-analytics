import { Router } from "express";
import { InterventionController } from "../controllers/intervention.controller";
import { requireAuth, requireRole } from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/",
  requireAuth,
  requireRole("admin", "academic_lead"),
  InterventionController.getAll,
);
router.get(
  "/faculty/:facultyId",
  requireAuth,
  InterventionController.getByFaculty,
);
router.patch(
  "/:id",
  requireAuth,
  requireRole("admin", "academic_lead"),
  InterventionController.updateStatus,
);

export default router;
