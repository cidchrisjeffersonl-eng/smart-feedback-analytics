import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../services/auth.service";
import { AuthPayload, UserRole } from "../types";
import pool from "../config/db";

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }
  const token = header.split(" ")[1];
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// Re-checks the user's CURRENT role from the database rather than trusting
// the role baked into the JWT at login time. This closes the gap where a
// demoted/banned user could keep using admin-level access until their
// token naturally expires (up to 7 days with our current settings).
export function requireRole(...roles: UserRole[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }
    try {
      const result = await pool.query(`SELECT role FROM users WHERE id = $1`, [
        req.user.id,
      ]);
      const currentRole = result.rows[0]?.role;

      if (!currentRole) {
        return res.status(401).json({ message: "User no longer exists" });
      }
      if (!roles.includes(currentRole)) {
        return res
          .status(403)
          .json({ message: "Forbidden: insufficient role" });
      }

      req.user.role = currentRole; // keep req.user in sync with the real current role
      next();
    } catch (err) {
      console.error("Role check failed:", err);
      res.status(500).json({ message: "Failed to verify permissions" });
    }
  };
}
