import { Router } from "express";
import { DepartmentController } from "../controllers/department.controller";
import { requireAuth, requireRole } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validate.middleware";
import { departmentSchema } from "../validators/department.validator";

const router = Router();

router.get(
  "/",
  requireAuth,
  requireRole("admin", "academic_lead"),
  DepartmentController.getAll,
);
router.post(
  "/",
  requireAuth,
  requireRole("admin", "academic_lead"),
  validateBody(departmentSchema),
  DepartmentController.create,
);
router.put(
  "/:id",
  requireAuth,
  requireRole("admin", "academic_lead"),
  validateBody(departmentSchema),
  DepartmentController.update,
);
router.delete(
  "/:id",
  requireAuth,
  requireRole("admin", "academic_lead"),
  DepartmentController.remove,
);

export default router;
