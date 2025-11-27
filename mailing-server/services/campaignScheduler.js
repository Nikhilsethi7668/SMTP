// mailing-server/services/campaignScheduler.js
import cron from "node-cron";
import moment from "moment-timezone";
import mongoose from "mongoose";
import { emailQueue } from "../queues/emailQueue.js";

import { Campaign } from "../models/campaignModel.js";
import { CampaignSchedule } from "../models/campaignSchedule.js";
import { CampaignSequenceStep } from "../models/campaignSequenceStep.js";
import { CampaignSequenceVariant } from "../models/campaignSequenceVariant.js";
import Lead from "../models/leadModel.js";

/**
 * Helper: check if now is within schedule window
 */
const isWithinSchedule = (schedule, campaignTimezone) => {
  if (!schedule) return true;
  const tz = schedule.timezone || campaignTimezone || process.env.TZ || "UTC";
  const now = moment().tz(tz);

  if (schedule.start_date) {
    const start = moment(schedule.start_date).tz(tz).startOf("day");
    if (now.isBefore(start)) return false;
  }
  if (schedule.end_date) {
    const end = moment(schedule.end_date).tz(tz).endOf("day");
    if (now.isAfter(end)) return false;
  }

  if (Array.isArray(schedule.days) && schedule.days.length > 0) {
    const dayName = now.format("dddd");
    if (!schedule.days.includes(dayName)) return false;
  }

  if (schedule.from_time && schedule.to_time) {
    const currentTime = now.format("HH:mm");
    const from = moment(schedule.from_time, "H:mm").format("HH:mm");
    const to = moment(schedule.to_time, "H:mm").format("HH:mm");
    if (from <= to) {
      if (currentTime < from || currentTime > to) return false;
    } else {
      // overnight window
      if (currentTime < from && currentTime > to) return false;
    }
  }

  return true;
};

/**
 * Count today's scheduled+completed jobs for campaign.
 * (Simple approach using queue job lists; OK for modest queue sizes)
 */
const getTodayCampaignCounts = async (campaignId) => {
  try {
    const tz = process.env.TZ || "UTC";
    const startOfDay = moment().tz(tz).startOf("day").toDate();
    const endOfDay = moment().tz(tz).endOf("day").toDate();

    const completed = await emailQueue.getJobs(["completed"], 0, 1000);
    const completedToday = completed.filter((j) => {
      return j.data?.campaignId === campaignId.toString() && j.finishedOn && new Date(j.finishedOn) >= startOfDay && new Date(j.finishedOn) <= endOfDay;
    }).length;

    const waitingActive = await emailQueue.getJobs(["waiting", "active"], 0, 1000);
    const scheduledToday = waitingActive.filter((j) => j.data?.campaignId === campaignId.toString()).length;

    return { sentToday: completedToday, scheduledToday, totalScheduled: completedToday + scheduledToday };
  } catch (err) {
    console.error("getTodayCampaignCounts error:", err);
    return { sentToday: 0, scheduledToday: 0, totalScheduled: 0 };
  }
};

/**
 * Round-robin variant selection using atomic counter on Campaign.variant_counters.<stepId>
 */
const pickRoundRobinVariantIndex = async (campaignId, stepId, variantsCount) => {
  if (!variantsCount || variantsCount <= 0) return 0;
  const field = `variant_counters.${stepId.toString()}`;
  const updated = await Campaign.findByIdAndUpdate(
    campaignId,
    { $inc: { [field]: 1 } },
    { new: true, useFindAndModify: false }
  ).lean();
  const val = (updated?.variant_counters?.[stepId.toString()]) || 1;
  return (val - 1) % variantsCount;
};

/**
 * Schedule step: find leads in sending_mails status and current_step == stepIndex,
 * then queue jobs up to remaining daily limit.
 */
const scheduleStepForCampaign = async (campaign, schedule, step, variants) => {
  try {
    const stepIndex = (step.order || 1) - 1;

    const leads = await Lead.find({
      campaign: campaign._id,
      status: "sending_mails",
      current_step: stepIndex,
    }).limit(1000).lean();

    if (!leads || leads.length === 0) return { scheduled: 0, message: "no-leads" };

    const dailyLimit = campaign.daily_limit || campaign.daily_quota || null;
    const todayStats = await getTodayCampaignCounts(campaign._id);
    let remaining = dailyLimit ? Math.max(0, dailyLimit - (todayStats.totalScheduled || 0)) : Number.POSITIVE_INFINITY;
    if (remaining <= 0) return { scheduled: 0, message: "daily-limit-reached", todayStats };

    const toSchedule = Math.min(remaining, leads.length);
    const scheduledJobs = [];
    const jitterSeconds = parseInt(process.env.SEND_JITTER_SECONDS || "300", 10);
    const minJitter = 5;

    for (let i = 0; i < toSchedule; i++) {
      const lead = leads[i];

      // variant selection (round robin)
      let variant = null;
      if (variants?.length > 0) {
        const vidx = await pickRoundRobinVariantIndex(campaign._id, step._id, variants.length);
        variant = variants[vidx];
      }

      // sender rotation (round robin)
      let fromEmail = null;
      if (Array.isArray(campaign.from_email) && campaign.from_email.length > 0) {
        // best-effort rotation using campaign._sender_rotate_index
        const idx = (i + (typeof campaign._sender_rotate_index === "number" ? campaign._sender_rotate_index : 0)) % campaign.from_email.length;
        fromEmail = campaign.from_email[idx];
      }

      const isFirstEmail = stepIndex === 0;
      const sendTextOnly = !!(campaign.send_text_only || (isFirstEmail && campaign.first_email_text_only));
      const subject = variant?.subject || step.subject || "";
      const bodyHtml = sendTextOnly ? undefined : (variant?.body || step.body || "");
      const bodyText = variant?.text || step.text || (bodyHtml ? undefined : (variant?.body || step.body || ""));

      const tracking = { openTracking: !!campaign.open_tracking };

      // random jitter delay within jitterSeconds
      const delaySec = Math.floor(Math.random() * Math.max(1, jitterSeconds - minJitter)) + minJitter;
      const delayMs = delaySec * 1000;

      const jobData = {
        campaignId: campaign._id.toString(),
        leadId: lead._id.toString(),
        stepId: step._id.toString(),
        variantId: variant?._id?.toString() || null,
        scheduleId: schedule?._id?.toString() || null,

        fromEmail,
        toEmail: lead.email,
        subject,
        bodyText,
        bodyHtml,

        isFirstEmail,
        sendTextOnly: sendTextOnly,

        openTracking: tracking.openTracking,
        trackingPixelUrl: "", // worker will populate if needed
        unsubscribeUrl: "", // worker can insert campaign-specific unsubscribe if desired

        provider: lead.provider,

        meta: {
          sequenceOrder: step.order,
          variantIndex: variant ? variants.findIndex(v => v._id.toString() === (variant._id?.toString())) : 0,
          dailyLimit: dailyLimit || null,
          timezone: campaign.timezone || schedule?.timezone || process.env.TZ || "UTC",
        },
      };

      const job = await emailQueue.add("send-email", jobData, {
        delay: delayMs,
        priority: 0,
        jobId: `campaign-${campaign._id}-lead-${lead._id}-${Date.now()}-${i}`,
      });

      scheduledJobs.push(job.id);

      // mark lead progressed (avoid duplicates). Worker will update real status after send.
      await Lead.findByIdAndUpdate(lead._id, {
        $set: { current_step: (lead.current_step || 0) + 1, last_scheduled_at: new Date() },
      });

      // increment campaign rotate index
      if (Array.isArray(campaign.from_email) && campaign.from_email.length > 0) {
        await Campaign.findByIdAndUpdate(campaign._id, { $inc: { _sender_rotate_index: 1 } });
      }

      if (dailyLimit) remaining--;
      if (remaining <= 0) break;
    }

    const newStats = await getTodayCampaignCounts(campaign._id);
    return { scheduled: scheduledJobs.length, jobIds: scheduledJobs, todayStats: newStats };
  } catch (err) {
    console.error("scheduleStepForCampaign error:", err);
    return { scheduled: 0, error: err.message };
  }
};

/**
 * Process one campaign: loads schedule, steps, variants and schedules step jobs
 */
const processCampaign = async (campaign) => {
  try {
    console.log(`Processing campaign ${campaign.name} (${campaign._id})`);
    if (campaign.status !== "running") return { processed: 0, message: "not-running" };

    const schedule = await CampaignSchedule.findOne({ campaign_id: campaign._id, archived: { $ne: true } }).lean();
    const timezone = campaign.timezone || schedule?.timezone || process.env.TZ || "UTC";

    if (!isWithinSchedule(schedule, timezone)) {
      return { processed: 0, message: "outside-schedule" };
    }

    const steps = await CampaignSequenceStep.find({ campaign_id: campaign._id }).sort({ order: 1 }).lean();
    if (!steps || steps.length === 0) return { processed: 0, message: "no-steps" };

    let totalScheduled = 0;
    const results = [];

    for (const step of steps) {
      const variants = await CampaignSequenceVariant.find({ step_id: step._id, campaign_id: campaign._id }).lean();
      const res = await scheduleStepForCampaign(campaign, schedule, step, variants);
      results.push({ stepId: step._id.toString(), stepOrder: step.order, ...res });
      totalScheduled += res.scheduled || 0;

      if (campaign.daily_limit && res.todayStats && res.todayStats.totalScheduled >= campaign.daily_limit) {
        break;
      }
    }

    return { processed: 1, scheduled: totalScheduled, results };
  } catch (err) {
    console.error("processCampaign error:", err);
    return { processed: 0, error: err.message };
  }
};

/**
 * Process running campaigns
 */
export const processRunningCampaigns = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    }

    const campaigns = await Campaign.find({ status: "running", archived: { $ne: true } }).lean();
    if (!campaigns || campaigns.length === 0) return { success: true, count: 0 };

    const out = [];
    for (const c of campaigns) {
      const r = await processCampaign(c);
      out.push({ campaignId: c._id.toString(), ...r });
    }

    return { success: true, count: campaigns.length, results: out };
  } catch (err) {
    console.error("processRunningCampaigns error:", err);
    return { success: false, error: err.message };
  }
};

/**
 * Start cron scheduler
 */
export const startCampaignScheduler = (cronExpr = process.env.CAMPAIGN_CRON || "*/5 * * * *") => {
  console.log("Starting campaign scheduler with", cronExpr);
  if (!cron.validate(cronExpr)) {
    console.error("Invalid cron expression; defaulting to */5 * * * *");
    cronExpr = "*/5 * * * *";
  }

  // initial run
  processRunningCampaigns().then(res => console.log("Initial campaign run complete:", res)).catch(err => console.error(err));

  cron.schedule(cronExpr, async () => {
    console.log("Cron run campaign scheduler:", new Date().toISOString());
    try {
      await processRunningCampaigns();
    } catch (err) {
      console.error("Campaign cron error:", err);
    }
  }, { timezone: process.env.TZ || "UTC", scheduled: true });

  console.log("Campaign scheduler started");
};

export default { processRunningCampaigns, startCampaignScheduler };
