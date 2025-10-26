import { Campaign, ICampaign } from '../models/campaignModel.js';
import mongoose from 'mongoose';

/** ✅ Add a new campaign */
export const addCampaign = async (data: Partial<ICampaign>): Promise<ICampaign> => {
  const campaign = new Campaign(data);
  return await campaign.save();
};

/** ✅ Get campaigns (all or by user) */
export const getCampaigns = async (user_id?: string): Promise<ICampaign[]> => {
  const filter = user_id ? { user_id: new mongoose.Types.ObjectId(user_id) } : {};
  return await Campaign.find(filter).sort({ _id: 1 });
};

/** ✅ Get campaign by ID */
export const getCampaignById = async (campaign_id: string): Promise<ICampaign | null> => {
  return await Campaign.findById(campaign_id);
};

/** ✅ Update campaign */
export const updateCampaign = async (
  campaign_id: string,
  updates: Partial<ICampaign>
): Promise<ICampaign | null> => {
  return await Campaign.findByIdAndUpdate(
    campaign_id,
    { ...updates, updatedAt: new Date() },
    { new: true }
  );
};

/** ✅ Mark campaign status */
export const markCampaignStatus = async (campaign_id: string, status: string): Promise<void> => {
  await Campaign.findByIdAndUpdate(campaign_id, { status, updatedAt: new Date() });
};

/** ✅ Increment a metric (e.g., metrics_sent) */
export const incrementMetric = async (
  campaign_id: string,
  metric: keyof Pick<
    ICampaign,
    | 'metrics_sent'
    | 'metrics_delivered'
    | 'metrics_opened'
    | 'metrics_clicked'
    | 'metrics_bounced'
    | 'metrics_complaints'
  >,
  by: number = 1
): Promise<number | null> => {
  const allowed = [
    'metrics_sent',
    'metrics_delivered',
    'metrics_opened',
    'metrics_clicked',
    'metrics_bounced',
    'metrics_complaints',
  ];

  if (!allowed.includes(metric)) throw new Error('Invalid metric');

  const updated = await Campaign.findByIdAndUpdate(
    campaign_id,
    { $inc: { [metric]: by }, updatedAt: new Date() },
    { new: true }
  );

  return updated ? updated[metric] : null;
};

/** ✅ Archive/unarchive campaign */
export const archiveCampaign = async (campaign_id: string, archived: boolean = true): Promise<void> => {
  await Campaign.findByIdAndUpdate(campaign_id, { archived, updatedAt: new Date() });
};

/** ✅ Delete campaign */
export const deleteCampaign = async (campaign_id: string): Promise<void> => {
  await Campaign.findByIdAndDelete(campaign_id);
};

/** ✅ Get campaign metrics (aggregated or specific campaign) */
export const getCampaignMetrics = async (
  user_id: string,
  campaign_id?: string
): Promise<{
  metrics_sent: number;
  metrics_delivered: number;
  metrics_opened: number;
  metrics_clicked: number;
  metrics_bounced: number;
  metrics_complaints: number;
  total_campaigns: number;
} | null> => {
  const filter: any = { user_id: new mongoose.Types.ObjectId(user_id) };
  
  if (campaign_id) {
    filter._id = new mongoose.Types.ObjectId(campaign_id);
  }

  const campaigns = await Campaign.find(filter);
  
  if (campaigns.length === 0) {
    return null;
  }

  // Aggregate metrics from all campaigns
  const aggregatedMetrics = campaigns.reduce(
    (acc, campaign) => ({
      metrics_sent: acc.metrics_sent + campaign.metrics_sent,
      metrics_delivered: acc.metrics_delivered + campaign.metrics_delivered,
      metrics_opened: acc.metrics_opened + campaign.metrics_opened,
      metrics_clicked: acc.metrics_clicked + campaign.metrics_clicked,
      metrics_bounced: acc.metrics_bounced + campaign.metrics_bounced,
      metrics_complaints: acc.metrics_complaints + campaign.metrics_complaints,
      total_campaigns: campaigns.length,
    }),
    {
      metrics_sent: 0,
      metrics_delivered: 0,
      metrics_opened: 0,
      metrics_clicked: 0,
      metrics_bounced: 0,
      metrics_complaints: 0,
      total_campaigns: 0,
    }
  );

  return aggregatedMetrics;
};