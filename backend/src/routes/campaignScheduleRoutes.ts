import { Router } from "express";
import {
  createSchedule,
  getSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
} from "../controllers/campaignScheduleController.js";

const router = Router();

/**
 * BASE ROUTE: /api/schedules
 */

router.post("/", createSchedule);        // Create schedule
router.get("/", getSchedules);           // Get all schedules (with optional campaign filter)
router.get("/:id", getScheduleById);     // Get single schedule
router.put("/:id", updateSchedule);      // Update schedule
router.delete("/:id", deleteSchedule);   // Delete schedule

export default router;
