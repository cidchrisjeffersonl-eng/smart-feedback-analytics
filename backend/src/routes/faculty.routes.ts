import { Router } from "express";
import { FacultyController } from "../controllers/faculty.controller";

const router = Router();

router.get("/", FacultyController.getAll);

export default router;
