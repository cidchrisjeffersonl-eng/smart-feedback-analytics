import { Router } from "express";
import { CourseController } from "../controllers/course.controller";
import { requireAuth, requireRole } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validate.middleware";
import {
  createCourseSchema,
  updateCourseSchema,
} from "../validators/course.validator";

const router = Router();

router.get("/faculty/:facultyId", requireAuth, CourseController.getByFaculty);
router.get(
  "/",
  requireAuth,
  requireRole("admin", "academic_lead"),
  CourseController.getAll,
);
router.post(
  "/",
  requireAuth,
  requireRole("admin", "academic_lead"),
  validateBody(createCourseSchema),
  CourseController.create,
);
router.put(
  "/:id",
  requireAuth,
  requireRole("admin", "academic_lead"),
  validateBody(updateCourseSchema),
  CourseController.update,
);
router.delete(
  "/:id",
  requireAuth,
  requireRole("admin", "academic_lead"),
  CourseController.remove,
);

export default router;
