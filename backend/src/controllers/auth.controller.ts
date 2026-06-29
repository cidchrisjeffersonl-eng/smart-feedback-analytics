import { Request, Response } from "express";
import { UserModel } from "../models/user.model";
import { hashPassword, comparePassword, signToken } from "../services/auth.service";

export const AuthController = {
  async register(req: Request, res: Response) {
    try {
      const { full_name, email, password, role } = req.body;
      if (!full_name || !email || !password || !role) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const existing = await UserModel.findByEmail(email);
      if (existing) {
        return res.status(409).json({ message: "Email already registered" });
      }
      const password_hash = await hashPassword(password);
      const user = await UserModel.create(
        full_name,
        email,
        password_hash,
        role,
      );
      const token = signToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });
      res.status(201).json({ user, token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Registration failed" });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const user = await UserModel.findByEmail(email);
      if (!user)
        return res.status(401).json({ message: "Invalid credentials" });

      const valid = await comparePassword(password, user.password_hash);
      if (!valid)
        return res.status(401).json({ message: "Invalid credentials" });

      const token = signToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });
      delete user.password_hash;

      let faculty_id = null;
      if (user.role === "faculty") {
        faculty_id = await UserModel.findFacultyIdByUserId(user.id);
      }

      res.json({ user: { ...user, faculty_id }, token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Login failed" });
    }
  },
};
