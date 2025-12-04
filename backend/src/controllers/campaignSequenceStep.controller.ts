import { Request, Response } from "express";
import { CampaignSequenceStep } from "../models/CampaignSequenceStepModel.js";
import { CampaignSequenceVariant } from "../models/CampaignSequenceVariantModel.js";

// CREATE STEP
export const createStep = async (req: Request, res: Response) => {
  try {
    const { campaign_id, name, order } = req.body;

    const step = await CampaignSequenceStep.create({ campaign_id, name, order });

    return res.status(201).json({ success: true, step });
  } catch (error) {
    return res.status(500).json({ success: false, error });
  }
};

// GET ALL STEPS for a CAMPAIGN
export const getStepsByCampaign = async (req: Request, res: Response) => {
  try {
    const { campaign_id } = req.params;

    const steps = await CampaignSequenceStep.find({ campaign_id }).sort({ order: 1 });

    return res.json({ success: true, steps });
  } catch (error) {
    return res.status(500).json({ success: false, error });
  }
};

// UPDATE STEP
export const updateStep = async (req: Request, res: Response) => {
  try {
    const { step_id } = req.params;
    const { name, order } = req.body;

    const step = await CampaignSequenceStep.findByIdAndUpdate(
      step_id,
      { name, order },
      { new: true }
    );

    return res.json({ success: true, step });
  } catch (error) {
    return res.status(500).json({ success: false, error });
  }
};

// DELETE STEP + related VARIANTS
export const deleteStep = async (req: Request, res: Response) => {
  try {
    const { step_id } = req.params;

    await CampaignSequenceStep.findByIdAndDelete(step_id);

    // delete all variants inside this step
    await CampaignSequenceVariant.deleteMany({ step_id });

    return res.json({ success: true, message: "Step & its variants deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, error });
  }
};
