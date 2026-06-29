import { Request, Response } from "express";
import { FacultyModel } from "../models/faculty.model";


export const FacultyController = {
  async getAll(_req: Request, res: Response) {
    try {
      const faculty = await FacultyModel.findAll();
      res.json(faculty);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch faculty list" });
    }
  },
};
