import { Request } from "express";
import * as campaignModel from "../services/campaignService.js";

// Create a new campaign
export const createCampaign = async (req: Request, res: any) => {
  try {
    const data = req.body;
    const user_id = req.user.id
    if (!data || !data.name) {
      return res.status(400).json({ success: false, message: 'Missing required campaign fields' });
    }
    const campaign = await campaignModel.addCampaign({...data,user_id});
    return res.status(201).json({ success: true, campaign });
  } catch (error: any) {
    console.error('Error creating campaign:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to create campaign' });
  }
};

// Get campaigns (optionally by user)
export const listCampaigns = async (req: Request, res: any) => {
  try {
    const user = req.user._id;
    const campaigns = await campaignModel.getCampaigns(user?.toString());
    return res.status(200).json({ success: true, campaigns });
  } catch (error: any) {
    console.error('Error fetching campaigns:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch campaigns' });
  }
};

// Get a single campaign
export const getCampaign = async (req: Request, res: any) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ success: false, message: 'Invalid campaign id' });
    const campaign = await campaignModel.getCampaignById(id?.toString());
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
    return res.status(200).json({ success: true, campaign });
  } catch (error: any) {
    console.error('Error fetching campaign:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch campaign' });
  }
};

// Update campaign
export const updateCampaignHandler = async (req: Request, res: any) => {
  try {
    const id = Number(req.params.id);
    const updates = req.body;
    if (!id) return res.status(400).json({ success: false, message: 'Invalid campaign id' });
    const updated = await campaignModel.updateCampaign(id?.toString(), updates);
    return res.status(200).json({ success: true, campaign: updated });
  } catch (error: any) {
    console.error('Error updating campaign:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to update campaign' });
  }
};

// Change campaign status
export const setCampaignStatus = async (req: Request, res: any) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    if (!id || !status) return res.status(400).json({ success: false, message: 'Invalid id or status' });
    await campaignModel.markCampaignStatus(id?.toString(), status);
    return res.status(200).json({ success: true, message: 'Status updated' });
  } catch (error: any) {
    console.error('Error updating status:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to update status' });
  }
};

// Increment a metric
export const incrementCampaignMetric = async (req: Request, res: any) => {
  try {
    const id = Number(req.params.id);
    const { metric, by } = req.body;
    if (!id || !metric) return res.status(400).json({ success: false, message: 'Invalid id or metric' });
    const result = await campaignModel.incrementMetric(id?.toString(), metric, by || 1);
    return res.status(200).json({ success: true, result });
  } catch (error: any) {
    console.error('Error incrementing metric:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to increment metric' });
  }
};

// Archive or unarchive campaign
export const archiveCampaignHandler = async (req: Request, res: any) => {
  try {
    const id = Number(req.params.id);
    const { archived } = req.body;
    if (!id) return res.status(400).json({ success: false, message: 'Invalid id' });
    await campaignModel.archiveCampaign(id?.toString(), archived === undefined ? true : Boolean(archived));
    return res.status(200).json({ success: true, message: 'Campaign archived state updated' });
  } catch (error: any) {
    console.error('Error archiving campaign:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to archive campaign' });
  }
};

// Delete campaign
export const deleteCampaignHandler = async (req: Request, res: any) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: 'Invalid id' });
    await campaignModel.deleteCampaign(id?.toString());
    return res.status(200).json({ success: true, message: 'Campaign deleted' });
  } catch (error: any) {
    console.error('Error deleting campaign:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete campaign' });
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
};
