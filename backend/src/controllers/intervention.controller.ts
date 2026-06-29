import { Request, Response } from "express";
import { InterventionModel } from "../models/intervention.model";

export const InterventionController = {
  async getAll(_req: Request, res: Response) {
    try {
      const interventions = await InterventionModel.findAll();
      res.json(interventions);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch interventions" });
    }
  },

  async getByFaculty(req: Request & { user?: any }, res: Response) {
    try {
      const { facultyId } = req.params;
      const requester = req.user;

      const isPrivileged =
        requester?.role === "admin" || requester?.role === "academic_lead";
      const isOwnRecord = requester?.facultyId === facultyId;

      // Re-fetch the requester's own faculty_id from the DB since it's not in the JWT payload.
      if (!isPrivileged) {
        const pool = require("../config/db").default;
        const result = await pool.query(
          `SELECT id FROM faculty WHERE user_id = $1`,
          [requester?.id],
        );
        const ownFacultyId = result.rows[0]?.id;
        if (ownFacultyId !== facultyId) {
          return res
            .status(403)
            .json({
              message: "Forbidden: you can only view your own interventions",
            });
        }
      }

      const interventions = await InterventionModel.findByFaculty(facultyId);
      // Strip internal admin notes for faculty viewing their own record.
      const sanitized = isPrivileged
        ? interventions
        : interventions.map(({ notes, ...rest }) => rest);

      res.json(sanitized);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch interventions" });
    }
  },

  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const validStatuses = ["pending", "in_progress", "resolved", "dismissed"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const updated = await InterventionModel.updateStatus(id, status, notes);
      res.json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to update intervention" });
    }
  },
};
