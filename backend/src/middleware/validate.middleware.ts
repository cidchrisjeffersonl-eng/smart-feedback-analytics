import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const firstError = result.error.errors[0];
      return res.status(400).json({
        message: firstError?.message || "Invalid request body",
        errors: result.error.errors,
      });
    }
    req.body = result.data; // use the parsed/coerced data
    next();
  };
}
