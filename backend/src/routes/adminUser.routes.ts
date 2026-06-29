import { Router } from "express";
import { AdminUserController } from "../controllers/adminUser.controller";
import { requireAuth, requireRole } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth, requireRole("admin"));

router.get("/", AdminUserController.getAll);
router.patch("/:id/role", AdminUserController.updateRole);
router.delete("/:id", AdminUserController.remove);

export default router;
