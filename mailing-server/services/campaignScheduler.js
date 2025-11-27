import { Campaign } from "../models/campaignModel.js";
import { CampaignSequenceVariant } from "../models/CampaignSequenceVariant.js";
import { CampaignSequenceStep } from "../models/CampaignSequenceStep.js";
import { CampaignSchedule } from "../models/CampaignScheduleModel.js";
import { Lead } from "../models/leadModel.js";
import { sendEmail } from "./emailService.js";
import moment from "moment-timezone";

/* ------------------------------------------------------------------
   Utility: Check if sending is allowed based on schedule windows
------------------------------------------------------------------ */
const isWithinSchedule = (schedule, timezone) => {
  if (!schedule) return true;

  const now = moment().tz(timezone);

  // Date window
  if (schedule.start_date && now.isBefore(moment(schedule.start_date))) return false;
  if (schedule.end_date && now.isAfter(moment(schedule.end_date))) return false;

  // Day of week match
  const dayName = now.format("dddd");
  if (schedule.days && !schedule.days.includes(dayName)) return false;

  // Time window
  if (schedule.from_time && schedule.to_time) {
    const currentTime = now.format("HH:mm");
    if (currentTime < schedule.from_time || currentTime > schedule.to_time) {
      return false;
    }
  }

  return true;
};

/* ------------------------------------------------------------------
   Utility: Rotate FROM emails
------------------------------------------------------------------ */
const getFromEmail = (emails, index) => {
  if (!emails || emails.length === 0) return null;
  return emails[index % emails.length];
};

/* ------------------------------------------------------------------
   MAIN SERVICE: Send Emails for Campaign
------------------------------------------------------------------ */
export const processCampaignSending = async (campaignId) => {
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) throw new Error("Campaign not found");

  // do not process if not active
  if (campaign.status !== "running") {
    console.log("Campaign is not running. Skipping...");
    return;
  }

  const timezone = campaign.timezone || "UTC";

  /* ------------------------------------------------------------------
     1) Load Schedule
  ------------------------------------------------------------------ */
  const schedule = await CampaignSchedule.findOne({
    campaign_id: campaignId,
    archived: { $ne: true },
  });

  if (!isWithinSchedule(schedule, timezone)) {
    console.log("Campaign outside allowed schedule window — SKIP");
    return;
  }

  /* ------------------------------------------------------------------
     2) Check daily limit
  ------------------------------------------------------------------ */
  const today = moment().tz(timezone).startOf("day");
  const tomorrow = moment(today).add(1, "day");

  const sentToday = await Lead.countDocuments({
    campaign_id: campaignId,
    "email_activity.sent_at": {
      $gte: today.toDate(),
      $lt: tomorrow.toDate(),
    },
  });

  if (campaign.daily_limit && sentToday >= campaign.daily_limit) {
    console.log("Daily limit reached — STOP");
    return;
  }

  /* ------------------------------------------------------------------
     3) Load active variant + steps
  ------------------------------------------------------------------ */
  const variant = await CampaignSequenceVariant.findOne({
    campaign_id: campaignId,
    is_active: true,
  });

  if (!variant) {
    console.log("No active sequence variant found");
    return;
  }

  const steps = await CampaignSequenceStep.find({
    sequence_variant_id: variant._id,
  }).sort({ order: 1 });

  if (steps.length === 0) {
    console.log("No sequence steps found");
    return;
  }

  /* ------------------------------------------------------------------
     4) Load leads to send email to
  ------------------------------------------------------------------ */
  const leads = await Lead.find({
    campaign_id: campaignId,
    status: "active",
  });

  let rotationIndex = 0;

  /* ------------------------------------------------------------------
     5) Email Sending Loop
  ------------------------------------------------------------------ */
  for (const lead of leads) {
    // Skip if we stop on reply
    if (campaign.stop_on_reply && lead.has_replied) continue;

    const nextStep = steps[lead.current_step || 0];
    if (!nextStep) continue;

    // Build email payload
    const emailData = {
      to: lead.email,
      from: getFromEmail(campaign.from_email || [], rotationIndex),
      subject: nextStep.subject,
      html:
        campaign.send_text_only || nextStep.text_only
          ? undefined
          : nextStep.html,
      text: nextStep.text || "",
      tracking: {
        open_tracking: campaign.open_tracking,
      },
    };

    // Send using your already existing email service
    console.log(emailData)
    // const result = await sendEmail(emailData);
    rotationIndex++;

    // Push email history
    lead.email_activity.push({
      step_id: nextStep._id,
      sent_at: new Date(),
      message_id: result?.messageId || "",
    });

    lead.current_step = (lead.current_step || 0) + 1;
    await lead.save();

    // Update campaign metrics
    campaign.metrics_sent = (campaign.metrics_sent || 0) + 1;
    await campaign.save();

    // Stop if daily limit hit mid-way
    if (campaign.daily_limit && rotationIndex >= campaign.daily_limit) {
      console.log("Daily limit reached during loop — STOP");
      break;
    }
  }

  console.log("Sending process completed for campaign:", campaignId);
};
