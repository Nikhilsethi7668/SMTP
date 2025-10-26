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
} from "../controllers/campaignController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// Campaign CRUD operations
router.post("/campaigns",authenticate, createCampaign);
router.get("/campaigns",authenticate, listCampaigns);
router.get("/campaigns/:id",authenticate, getCampaign);
router.put("/campaigns/:id",authenticate, updateCampaignHandler);
router.delete("/campaigns/:id",authenticate, deleteCampaignHandler);

// Campaign-specific operations
router.post("/campaigns/:id/status",authenticate, setCampaignStatus);
router.post("/campaigns/:id/metrics",authenticate, incrementCampaignMetric);
router.post("/campaigns/:id/archive",authenticate, archiveCampaignHandler);

export default router;