import { Request, Response } from "express";
import { CampaignSequenceVariant } from "../models/CampaignSequenceVariantModel.js";

// CREATE VARIANT
export const createVariant = async (req: Request, res: Response) => {
  try {
    const { step_id, campaign_id, subject, body } = req.body;

    const variant = await CampaignSequenceVariant.create({
      step_id,
      campaign_id,
      subject,
      body,
    });

    return res.status(201).json({ success: true, variant });
  } catch (error) {
    return res.status(500).json({ success: false, error });
  }
};

// GET VARIANTS BY STEP
export const getVariantsByStep = async (req: Request, res: Response) => {
  try {
    const { step_id } = req.params;

    const variants = await CampaignSequenceVariant.find({ step_id });

    return res.json({ success: true, variants });
  } catch (error) {
    return res.status(500).json({ success: false, error });
  }
};

// UPDATE VARIANT
export const updateVariant = async (req: Request, res: Response) => {
  try {
    const { variant_id } = req.params;
    const { subject, body } = req.body;

    const variant = await CampaignSequenceVariant.findByIdAndUpdate(
      variant_id,
      { subject, body },
      { new: true }
    );

    return res.json({ success: true, variant });
  } catch (error) {
    return res.status(500).json({ success: false, error });
  }
};

// DELETE VARIANT
export const deleteVariant = async (req: Request, res: Response) => {
  try {
    const { variant_id } = req.params;

    await CampaignSequenceVariant.findByIdAndDelete(variant_id);

    return res.json({ success: true, message: "Variant deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, error });
  }
};
