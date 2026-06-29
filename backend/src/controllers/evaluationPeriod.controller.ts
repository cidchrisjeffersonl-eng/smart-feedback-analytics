import { Request, Response } from "express";
import { EvaluationPeriodModel } from "../models/evaluationPeriod.model";

export const EvaluationPeriodController = {
  async getAll(_req: Request, res: Response) {
    try {
      const periods = await EvaluationPeriodModel.findAll();
      res.json(periods);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch evaluation periods" });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { title, start_date, end_date } = req.body;
      if (!title || !start_date || !end_date) {
        return res
          .status(400)
          .json({ message: "title, start_date, end_date are required" });
      }
      const period = await EvaluationPeriodModel.create(
        title,
        start_date,
        end_date,
      );
      res.status(201).json(period);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to create evaluation period" });
    }
  },

  async setActive(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { is_active } = req.body;
      const period = await EvaluationPeriodModel.setActive(id, is_active);
      res.json(period);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to update evaluation period" });
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await EvaluationPeriodModel.remove(id);
      res.status(204).send();
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to delete evaluation period" });
    }
  },
};
