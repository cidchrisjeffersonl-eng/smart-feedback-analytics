import { z } from "zod";

export const createPeriodSchema = z.object({
  title: z.string().min(1).max(150),
  start_date: z
    .string()
    .refine((v) => !isNaN(Date.parse(v)), "start_date must be a valid date"),
  end_date: z
    .string()
    .refine((v) => !isNaN(Date.parse(v)), "end_date must be a valid date"),
});

export const setActiveSchema = z.object({
  is_active: z.boolean(),
});
