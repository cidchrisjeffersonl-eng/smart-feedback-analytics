import { z } from "zod";

export const registerSchema = z.object({
  full_name: z
    .string()
    .min(2, "full_name must be at least 2 characters")
    .max(150),
  email: z.string().email("must be a valid email"),
  password: z.string().min(8, "password must be at least 8 characters"),
  role: z.enum(["student", "faculty", "admin", "academic_lead"]),
});

export const loginSchema = z.object({
  email: z.string().email("must be a valid email"),
  password: z.string().min(1, "password is required"),
});
