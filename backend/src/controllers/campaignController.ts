import { Request } from "express";
import * as campaignModel from "../services/campaignService.js";
import mongoose from "mongoose";

// Utility: normalize boolean safely
const toBool = (v: any) => {
  if (v === true || v === "true" || v === 1 || v === "1") return true;
  return false;
};

// Utility: normalize array safely
const toStringArray = (v: any) => {
  if (!v) return [];
  if (Array.isArray(v)) return v.map((x) => String(x));
  return [String(v)];
};

// --------------------------------------------------
// Create Campaign
// --------------------------------------------------
export const createCampaign = async (req: Request, res: any) => {
  try {
    const user_id = req.user.id;
    const data = req.body;

    if (!data || !data.name) {
      return res.status(400).json({ success: false, message: "Missing campaign name" });
    }

    // Normalize new fields
    const formattedData = {
      ...data,
      user_id,
      from_email: toStringArray(data.from_email),

      stop_on_reply: toBool(data.stop_on_reply),
      open_tracking: toBool(data.open_tracking),
      send_text_only: toBool(data.send_text_only),
      first_email_text_only: toBool(data.first_email_text_only),
      daily_limit: data.daily_limit ? Number(data.daily_limit) : null,
    };

    const campaign = await campaignModel.addCampaign(formattedData);

    return res.status(201).json({ success: true, campaign });
  } catch (error: any) {
    console.error("Error creating campaign:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create campaign",
    });
  }
};

// --------------------------------------------------
// Get Campaigns for user
// --------------------------------------------------
export const listCampaigns = async (req: Request, res: any) => {
  try {
    const user = req.user.id;
    const campaigns = await campaignModel.getCampaigns(user?.toString());
    return res.status(200).json({ success: true, campaigns });
  } catch (error: any) {
    console.error("Error fetching campaigns:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch campaigns",
    });
  }
};

// --------------------------------------------------
// Get Single Campaign
// --------------------------------------------------
export const getCampaign = async (req: Request, res: any) => {
  try {
    const id = req.params.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid campaign id" });
    }

    const campaign = await campaignModel.getCampaignById(id?.toString());
    if (!campaign)
      return res.status(404).json({ success: false, message: "Campaign not found" });

    return res.status(200).json({ success: true, campaign });
  } catch (error: any) {
    console.error("Error fetching campaign:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch campaign",
    });
  }
};

// --------------------------------------------------
// Update Campaign
// --------------------------------------------------
export const updateCampaignHandler = async (req: Request, res: any) => {
  try {
    const id = req.params.id;
    let updates = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid campaign id" });
    }

    // Normalize incoming update fields
    updates = {
      ...updates,
      from_email: updates.from_email ? toStringArray(updates.from_email) : undefined,
      stop_on_reply:
        updates.stop_on_reply !== undefined ? toBool(updates.stop_on_reply) : undefined,
      open_tracking:
        updates.open_tracking !== undefined ? toBool(updates.open_tracking) : undefined,
      send_text_only:
        updates.send_text_only !== undefined ? toBool(updates.send_text_only) : undefined,
      first_email_text_only:
        updates.first_email_text_only !== undefined
          ? toBool(updates.first_email_text_only)
          : undefined,
      daily_limit: updates.daily_limit ? Number(updates.daily_limit) : undefined,
    };

    const updated = await campaignModel.updateCampaign(id, updates);

    return res.status(200).json({ success: true, campaign: updated });
  } catch (error: any) {
    console.error("Error updating campaign:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update campaign",
    });
  }
};

// --------------------------------------------------
// Change Status
// --------------------------------------------------
export const setCampaignStatus = async (req: Request, res: any) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid(id) || !status) {
      return res.status(400).json({ success: false, message: "Invalid id or status" });
    }

    await campaignModel.markCampaignStatus(id, status);
    return res.status(200).json({ success: true, message: "Status updated" });
  } catch (error: any) {
    console.error("Error updating status:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update status",
    });
  }
};

// --------------------------------------------------
// Increment Metric
// --------------------------------------------------
export const incrementCampaignMetric = async (req: Request, res: any) => {
  try {
    const id = req.params.id;
    const { metric, by } = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid(id) || !metric) {
      return res.status(400).json({ success: false, message: "Invalid id or metric" });
    }

    const result = await campaignModel.incrementMetric(id, metric, by || 1);

    return res.status(200).json({ success: true, result });
  } catch (error: any) {
    console.error("Error incrementing metric:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to increment metric",
    });
  }
};

// --------------------------------------------------
// Archive Campaign
// --------------------------------------------------
export const archiveCampaignHandler = async (req: Request, res: any) => {
  try {
    const id = req.params.id;
    const { archived } = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    await campaignModel.archiveCampaign(id, archived === undefined ? true : Boolean(archived));

    return res.status(200).json({ success: true, message: "Campaign archived state updated" });
  } catch (error: any) {
    console.error("Error archiving campaign:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to archive campaign",
    });
  }
};

// --------------------------------------------------
// Delete Campaign
// --------------------------------------------------
export const deleteCampaignHandler = async (req: Request, res: any) => {
  try {
    const id = req.params.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    await campaignModel.deleteCampaign(id);

    return res.status(200).json({ success: true, message: "Campaign deleted" });
  } catch (error: any) {
    console.error("Error deleting campaign:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete campaign",
    });
  }
};

// --------------------------------------------------
// Get Metrics
// --------------------------------------------------
export const getCampaignMetrics = async (req: Request, res: any) => {
  try {
    const user_id = req.user.id;
    const campaign_id = req?.query?.campaignId?.toString();

    const metrics = await campaignModel.getCampaignMetrics(user_id?.toString(), campaign_id);

    if (!metrics) {
      return res.status(404).json({
        success: false,
        message: campaign_id ? "Campaign not found" : "No campaigns found",
      });
    }

    return res.status(200).json({ success: true, data: metrics });
  } catch (error: any) {
    console.error("Error fetching metrics:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch metrics",
    });
  }
};

// --------------------------------------------------
// Get only names + IDs
// --------------------------------------------------
export const getCampaignNames = async (req: Request, res: any) => {
  try {
    const user_id = req.user.id;
    const campaigns = await campaignModel.getCampaignNames(user_id?.toString());

    return res.status(200).json({ success: true, campaigns });
  } catch (error: any) {
    console.error("Error fetching campaign names:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch campaign names",
    });
  }
};

export default {
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
};
