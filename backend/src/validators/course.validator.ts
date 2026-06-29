import { z } from "zod";

export const createCourseSchema = z.object({
  faculty_id: z.string().uuid(),
  course_code: z.string().min(1).max(20),
  course_name: z.string().min(1).max(150),
  semester: z.string().max(20).optional().nullable(),
  academic_year: z.string().max(20).optional().nullable(),
});

export const updateCourseSchema = z.object({
  course_code: z.string().min(1).max(20),
  course_name: z.string().min(1).max(150),
  semester: z.string().max(20).optional().nullable(),
  academic_year: z.string().max(20).optional().nullable(),
});
