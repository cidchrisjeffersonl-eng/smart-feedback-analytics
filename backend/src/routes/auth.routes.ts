import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validateBody } from "../middleware/validate.middleware";
import { registerSchema, loginSchema } from "../validators/auth.validator";
import { authLimiter } from "../middleware/rateLimit.middleware";

const router = Router();

router.post(
  "/register",
  authLimiter,
  validateBody(registerSchema),
  AuthController.register,
);
router.post(
  "/login",
  authLimiter,
  validateBody(loginSchema),
  AuthController.login,
);

export default router;
