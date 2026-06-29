import { Request, Response } from "express";
import { DepartmentModel } from "../models/department.model";

export const DepartmentController = {
  async getAll(_req: Request, res: Response) {
    try {
      const departments = await DepartmentModel.findAll();
      res.json(departments);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch departments" });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { name } = req.body;
      const department = await DepartmentModel.create(name);
      res.status(201).json(department);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to create department" });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const department = await DepartmentModel.update(id, name);
      res.json(department);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to update department" });
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await DepartmentModel.remove(id);
      res.status(204).send();
    } catch (err) {
      console.error(err);
      // Likely a foreign key constraint violation if faculty still reference it
      res
        .status(400)
        .json({
          message:
            "Cannot delete — faculty members are still assigned to this department",
        });
    }
  },
};
