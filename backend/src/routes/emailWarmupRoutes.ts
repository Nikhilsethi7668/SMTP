import express from "express";
import {
  createEmailWarmup,
  getUserWarmups,
  getWarmupById,
  updateWarmupStatus,
  deleteWarmup,
} from "../controllers/emailWarmupController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Create a new warmup
router.post("/warmup", createEmailWarmup);

// Get all warmups for the user
router.get("/warmup", getUserWarmups);

// Get a single warmup by ID
router.get("/warmup/:id", getWarmupById);

// Update warmup status
router.patch("/warmup/:id/status", updateWarmupStatus);

// Delete a warmup
router.delete("/warmup/:id", deleteWarmup);

export default router;

