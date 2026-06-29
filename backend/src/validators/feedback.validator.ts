import { z } from "zod";

export const submitFeedbackSchema = z.object({
  student_id: z.string().uuid().nullable().optional(),
  faculty_id: z.string().uuid({ message: "faculty_id must be a valid UUID" }),
  course_id: z.string().uuid({ message: "course_id must be a valid UUID" }),
  evaluation_period_id: z.string().uuid().nullable().optional(),
  rating: z
    .number()
    .int()
    .min(1, "rating must be at least 1")
    .max(5, "rating must be at most 5"),
  comment: z
    .string()
    .max(2000, "comment must be under 2000 characters")
    .optional()
    .nullable(),
});
