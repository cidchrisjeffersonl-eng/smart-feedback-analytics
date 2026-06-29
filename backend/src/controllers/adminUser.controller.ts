import { Request, Response } from "express";
import { AdminUserModel } from "../models/adminUser.model";

export const AdminUserController = {
  async getAll(_req: Request, res: Response) {
    try {
      const users = await AdminUserModel.findAll();
      res.json(users);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  },

  async updateRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const validRoles = ["student", "faculty", "admin", "academic_lead"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      const user = await AdminUserModel.updateRole(id, role);
      res.json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to update role" });
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await AdminUserModel.remove(id);
      res.status(204).send();
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to delete user" });
    }
  },
};
