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

const router = express.Router();

// Campaign CRUD operations
router.post("/campaigns", createCampaign);
router.get("/campaigns", listCampaigns);
router.get("/campaigns/:id", getCampaign);
router.put("/campaigns/:id", updateCampaignHandler);
router.delete("/campaigns/:id", deleteCampaignHandler);

// Campaign-specific operations
router.post("/campaigns/:id/status", setCampaignStatus);
router.post("/campaigns/:id/metrics", incrementCampaignMetric);
router.post("/campaigns/:id/archive", archiveCampaignHandler);

export default router;