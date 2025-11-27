import express from "express";
import {
  createCampaign,
  listCampaigns,
  getCampaign,
  updateCampaignHandler,
  setCampaignStatus,
  incrementCampaignMetric,
  archiveCampaignHandler,
  deleteCampaignHandler,
  getCampaignMetrics,
  getCampaignNames,
} from "../controllers/campaignController.js";

import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ---------------------------------------------------------
   CAMPAIGN CRUD ROUTES
--------------------------------------------------------- */

// Create campaign
router.post("/campaigns", authenticate, createCampaign);

// List all campaigns
router.get("/campaigns", authenticate, listCampaigns);

// For dropdowns (names only)
router.get("/campaigns/names", authenticate, getCampaignNames);

// DO NOT PLACE BELOW /campaigns/:id
router.get("/campaigns/metrics", authenticate, getCampaignMetrics);

// Get single campaign
router.get("/campaigns/:id", authenticate, getCampaign);

// Update full campaign (supports new fields)
router.put("/campaigns/:id", authenticate, updateCampaignHandler);

// Delete campaign
router.delete("/campaigns/:id", authenticate, deleteCampaignHandler);


/* ---------------------------------------------------------
   CAMPAIGN OPERATIONS
--------------------------------------------------------- */

// Change status (pause, running, draft, etc.)
router.post("/campaigns/:id/status", authenticate, setCampaignStatus);

// Increment a metric
router.post("/campaigns/:id/metrics", authenticate, incrementCampaignMetric);

// Archive / unarchive
router.post("/campaigns/:id/archive", authenticate, archiveCampaignHandler);


/* ---------------------------------------------------------
   OPTIONAL — Update campaign settings only (NEW)
   Useful if frontend updates only flags like:
   - stop_on_reply
   - open_tracking
   - send_text_only
   - first_email_text_only
   - daily_limit
--------------------------------------------------------- */

router.patch("/campaigns/:id/settings", authenticate, updateCampaignHandler);

export default router;
