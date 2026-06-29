import { Request, Response } from "express";
import { CourseModel } from "../models/course.model";

export const CourseController = {
  async getByFaculty(req: Request, res: Response) {
    try {
      const { facultyId } = req.params;
      const courses = await CourseModel.findByFaculty(facultyId);
      res.json(courses);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  },

  async getAll(_req: Request, res: Response) {
    try {
      const courses = await CourseModel.findAll();
      res.json(courses);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { faculty_id, course_code, course_name, semester, academic_year } =
        req.body;
      if (!faculty_id || !course_code || !course_name) {
        return res
          .status(400)
          .json({
            message: "faculty_id, course_code, course_name are required",
          });
      }
      const course = await CourseModel.create(
        faculty_id,
        course_code,
        course_name,
        semester,
        academic_year,
      );
      res.status(201).json(course);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to create course" });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { course_code, course_name, semester, academic_year } = req.body;
      const course = await CourseModel.update(
        id,
        course_code,
        course_name,
        semester,
        academic_year,
      );
      res.json(course);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to update course" });
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await CourseModel.remove(id);
      res.status(204).send();
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to delete course" });
    }
  },
};
