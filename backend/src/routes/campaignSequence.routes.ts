import { Router } from "express";
import {
  createStep,
  getStepsByCampaign,
  updateStep,
  deleteStep,
} from "../controllers/campaignSequenceStep.controller.js";

import {
  createVariant,
  getVariantsByStep,
  updateVariant,
  deleteVariant,
} from "../controllers/campaignSequenceVariant.controller.js";
import { sendTestEmail } from "../controllers/testEmail.controller.js";
const router = Router();

// STEP ROUTES
router.post("/steps", createStep);
router.get("/steps/:campaign_id", getStepsByCampaign);
router.put("/steps/:step_id", updateStep);
router.delete("/steps/:step_id", deleteStep);

// VARIANT ROUTES
router.post("/variants", createVariant);
router.get("/variants/:step_id", getVariantsByStep);
router.put("/variants/:variant_id", updateVariant);
router.delete("/variants/:variant_id", deleteVariant);

router.post("/variants/:variant_id/test", sendTestEmail);
export default router;
