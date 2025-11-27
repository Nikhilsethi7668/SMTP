// mailing-server/services/campaignScheduler.js
import cron from "node-cron";
import moment from "moment-timezone";
import mongoose from "mongoose";
import { emailQueue } from "../queues/emailQueue.js";

import { Campaign } from "../models/campaignModel.js";
import { CampaignSchedule } from "../models/CampaignScheduleModel.js";
import { CampaignSequenceStep } from "../models/CampaignSequenceStepModel.js";
import { CampaignSequenceVariant } from "../models/CampaignSequenceVariantModel.js";
import Lead from "../models/leadModel.js";

/**
 * Helper: normalize timezone names (e.g., IST -> Asia/Kolkata)
 */
const normalizeTimezone = (tz) => {
  if (!tz) return process.env.TZ || "UTC";

  const timezoneMap = {
    IST: "Asia/Kolkata",
    EST: "America/New_York",
    PST: "America/Los_Angeles",
    CST: "America/Chicago",
    MST: "America/Denver",
    GMT: "Europe/London",
    UTC: "UTC",
  };

  // Check if it's a common abbreviation
  if (timezoneMap[tz.toUpperCase()]) {
    return timezoneMap[tz.toUpperCase()];
  }

  // If it already looks like a proper timezone (contains /), use it as-is
  if (tz.includes("/")) {
    return tz;
  }

  // Try to use as-is, moment-timezone might handle it
  return tz;
};

/**
 * Helper: check if now is within schedule window
 */
const isWithinSchedule = (schedule, campaignTimezone) => {
  if (!schedule) {
    console.log(`   ✅ No schedule restrictions (always active)`);
    return true;
  }

  const rawTz =
    schedule.timezone || campaignTimezone || process.env.TZ || "UTC";
  const tz = normalizeTimezone(rawTz);
  const now = moment().tz(tz);

  console.log(
    `   🕐 Current time in ${tz}: ${now.format("YYYY-MM-DD HH:mm:ss dddd")}`
  );

  if (schedule.start_date) {
    const start = moment(schedule.start_date).tz(tz).startOf("day");
    const isAfterStart = now.isSame(start, "day") || now.isAfter(start);
    console.log(
      `   📅 Start date check: ${now.format("YYYY-MM-DD")} >= ${start.format(
        "YYYY-MM-DD"
      )}? ${isAfterStart}`
    );
    if (!isAfterStart) {
      console.log(`   ❌ Before start date`);
      return false;
    }
  }

  if (schedule.end_date) {
    const end = moment(schedule.end_date).tz(tz).endOf("day");
    const isBeforeEnd = now.isSame(end, "day") || now.isBefore(end);
    console.log(
      `   📅 End date check: ${now.format("YYYY-MM-DD")} <= ${end.format(
        "YYYY-MM-DD"
      )}? ${isBeforeEnd}`
    );
    if (!isBeforeEnd) {
      console.log(`   ❌ After end date`);
      return false;
    }
  }

  if (Array.isArray(schedule.days) && schedule.days.length > 0) {
    const dayName = now.format("dddd");
    console.log(
      `   📆 Day check: Today is "${dayName}", allowed days: [${schedule.days.join(
        ", "
      )}]`
    );
    if (!schedule.days.includes(dayName)) {
      console.log(`   ❌ Today (${dayName}) is not in allowed days`);
      return false;
    }
  }

  if (schedule.from_time && schedule.to_time) {
    const currentTime = now.format("HH:mm");
    const from = moment(schedule.from_time, "H:mm").format("HH:mm");
    const to = moment(schedule.to_time, "H:mm").format("HH:mm");

    console.log(
      `   ⏰ Time window check: Current=${currentTime}, Window=${from}-${to}`
    );

    // If from_time equals to_time, treat as "all day" (no time restriction)
    if (from === to) {
      console.log(`   ✅ Time window is all day (${from} = ${to})`);
    } else if (from <= to) {
      // Normal time window (e.g., 9:00 - 17:00)
      const isWithin = currentTime >= from && currentTime <= to;
      console.log(
        `   ${isWithin ? "✅" : "❌"} Time check: ${currentTime} is ${
          isWithin ? "within" : "outside"
        } window ${from}-${to}`
      );
      if (!isWithin) return false;
    } else {
      // Overnight window (e.g., 22:00 - 06:00)
      const isWithin = currentTime >= from || currentTime <= to;
      console.log(
        `   ${isWithin ? "✅" : "❌"} Overnight time check: ${currentTime} is ${
          isWithin ? "within" : "outside"
        } window ${from}-${to}`
      );
      if (!isWithin) return false;
    }
  }

  console.log(`   ✅ All schedule checks passed`);
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
      return (
        j.data?.campaignId === campaignId.toString() &&
        j.finishedOn &&
        new Date(j.finishedOn) >= startOfDay &&
        new Date(j.finishedOn) <= endOfDay
      );
    }).length;

    const waitingActive = await emailQueue.getJobs(
      ["waiting", "active"],
      0,
      1000
    );
    const scheduledToday = waitingActive.filter(
      (j) => j.data?.campaignId === campaignId.toString()
    ).length;

    return {
      sentToday: completedToday,
      scheduledToday,
      totalScheduled: completedToday + scheduledToday,
    };
  } catch (err) {
    console.error("getTodayCampaignCounts error:", err);
    return { sentToday: 0, scheduledToday: 0, totalScheduled: 0 };
  }
};

/**
 * Round-robin variant selection using atomic counter on Campaign.variant_counters.<stepId>
 */
const pickRoundRobinVariantIndex = async (
  campaignId,
  stepId,
  variantsCount
) => {
  if (!variantsCount || variantsCount <= 0) return 0;
  const field = `variant_counters.${stepId.toString()}`;
  const updated = await Campaign.findByIdAndUpdate(
    campaignId,
    { $inc: { [field]: 1 } },
    { new: true, useFindAndModify: false }
  ).lean();
  const val = updated?.variant_counters?.[stepId.toString()] || 1;
  return (val - 1) % variantsCount;
};

/**
 * Schedule step: find leads in sending_mails status and current_step == stepIndex,
 * then queue jobs up to remaining daily limit.
 */
const scheduleStepForCampaign = async (campaign, schedule, step, variants) => {
  try {
    const stepIndex = (step.order || 1) - 1;
    console.log(
      `   📍 Processing step ${step.order} (index ${stepIndex}) - "${
        step.name || "Unnamed"
      }"`
    );

    const leads = await Lead.find({
      campaign: campaign._id,
    })
      .limit(1000)
      .lean();

    console.log(`📋 Found ${leads?.length || 0} lead(s) for campaign`);

    if (!leads || leads.length === 0) {
      console.log(`   ⚠️ No leads found for step ${step.order}`);
      return { scheduled: 0, message: "no-leads" };
    }

    const dailyLimit = campaign.daily_limit || campaign.daily_quota || null;
    const todayStats = await getTodayCampaignCounts(campaign._id);
    console.log(
      `   📊 Today's stats: ${todayStats.sentToday} sent, ${todayStats.scheduledToday} scheduled, ${todayStats.totalScheduled} total`
    );

    if (dailyLimit) {
      console.log(`   📈 Daily limit: ${dailyLimit}`);
    } else {
      console.log(`   📈 Daily limit: Unlimited`);
    }

    let remaining = dailyLimit
      ? Math.max(0, dailyLimit - (todayStats.totalScheduled || 0))
      : Number.POSITIVE_INFINITY;
    if (remaining <= 0) {
      console.log(`   ⚠️ Daily limit (${dailyLimit}) already reached`);
      return { scheduled: 0, message: "daily-limit-reached", todayStats };
    }

    // Filter leads by status and current_step
    const eligibleLeads = leads.filter((lead) => {
      return (
        lead.status === "Not yet contacted" &&
        (lead.current_step || 0) === stepIndex
      );
    });

    console.log(
      `   ✅ ${eligibleLeads.length} lead(s) eligible (status: "Not yet contacted", current_step: ${stepIndex})`
    );
    if (eligibleLeads.length < leads.length) {
      console.log(
        `   ⚠️ ${
          leads.length - eligibleLeads.length
        } lead(s) filtered out (wrong status or step)`
      );
    }

    const toSchedule = Math.min(remaining, eligibleLeads.length);
    console.log(
      `   🎯 Scheduling ${toSchedule} email(s) (${remaining} remaining, ${eligibleLeads.length} eligible leads)`
    );

    const scheduledJobs = [];
    const jitterSeconds = parseInt(
      process.env.SEND_JITTER_SECONDS || "300",
      10
    );
    const minJitter = 5;
    console.log(`   ⏱️ Jitter delay: ${minJitter}-${jitterSeconds} seconds`);

    let skippedCount = 0;
    for (let i = 0; i < toSchedule; i++) {
      const lead = eligibleLeads[i];

      // Double-check status (safety check)
      if (lead.status !== "Not yet contacted") {
        console.log(
          `   ⚠️ Skipping lead ${lead._id} (${lead.email}) - status is "${lead.status}", not "Not yet contacted"`
        );
        skippedCount++;
        continue;
      }

      // variant selection (round robin)
      let variant = null;
      if (variants?.length > 0) {
        const vidx = await pickRoundRobinVariantIndex(
          campaign._id,
          step._id,
          variants.length
        );
        variant = variants[vidx];
      }

      // sender rotation (round robin)
      let fromEmail = null;
      if (
        Array.isArray(campaign.from_email) &&
        campaign.from_email.length > 0
      ) {
        // best-effort rotation using campaign._sender_rotate_index
        const idx =
          (i +
            (typeof campaign._sender_rotate_index === "number"
              ? campaign._sender_rotate_index
              : 0)) %
          campaign.from_email.length;
        fromEmail = campaign.from_email[idx];
      }

      const isFirstEmail = stepIndex === 0;
      const sendTextOnly = !!(
        campaign.send_text_only ||
        (isFirstEmail && campaign.first_email_text_only)
      );
      const subject = variant?.subject || step.subject || "";
      const bodyHtml = sendTextOnly
        ? undefined
        : variant?.body || step.body || "";
      const bodyText =
        variant?.text ||
        step.text ||
        (bodyHtml ? undefined : variant?.body || step.body || "");

      const tracking = { openTracking: !!campaign.open_tracking };

      // random jitter delay within jitterSeconds
      const delaySec =
        Math.floor(Math.random() * Math.max(1, jitterSeconds - minJitter)) +
        minJitter;
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
          variantIndex: variant
            ? variants.findIndex(
                (v) => v._id.toString() === variant._id?.toString()
              )
            : 0,
          dailyLimit: dailyLimit || null,
          timezone:
            campaign.timezone || schedule?.timezone || process.env.TZ || "UTC",
        },
      };

      const job = await emailQueue.add("send-email", jobData, {
        delay: delayMs,
        priority: 0,
        jobId: `campaign-${campaign._id}-lead-${lead._id}-${Date.now()}-${i}`,
      });

      scheduledJobs.push(job.id);
      const delayMinutes = Math.floor(delaySec / 60);
      const delaySecRemainder = delaySec % 60;
      const variantInfo = variant
        ? ` (variant ${
            variants.findIndex(
              (v) => v._id.toString() === variant._id?.toString()
            ) + 1
          })`
        : "";
      console.log(
        `   ✓ Job ${job.id} scheduled for ${
          lead.email
        }${variantInfo} (delay: ${delayMinutes}m ${delaySecRemainder}s, from: ${
          fromEmail || "N/A"
        })`
      );

      // mark lead progressed (avoid duplicates). Worker will update status to "contacted" after send.
      await Lead.findByIdAndUpdate(lead._id, {
        $set: {
          // current_step: (lead.current_step || 0) + 1,
          last_scheduled_at: new Date(),
        },
      });

      // increment campaign rotate index
      if (
        Array.isArray(campaign.from_email) &&
        campaign.from_email.length > 0
      ) {
        await Campaign.findByIdAndUpdate(campaign._id, {
          $inc: { _sender_rotate_index: 1 },
        });
      }

      if (dailyLimit) remaining--;
      if (remaining <= 0) {
        console.log(`   ⚠️ Daily limit reached, stopping scheduling`);
        break;
      }
    }

    if (skippedCount > 0) {
      console.log(
        `   ⚠️ Skipped ${skippedCount} lead(s) due to invalid status`
      );
    }

    const newStats = await getTodayCampaignCounts(campaign._id);
    console.log(
      `   ✅ Step ${step.order} complete: ${scheduledJobs.length} email(s) scheduled`
    );
    return {
      scheduled: scheduledJobs.length,
      jobIds: scheduledJobs,
      todayStats: newStats,
      skipped: skippedCount,
    };
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
    console.log(
      `\n📬 Processing campaign: ${campaign.name} (ID: ${campaign._id})`
    );
    console.log(`   Status: ${campaign.status}`);

    if (campaign.status !== "running") {
      console.log(
        `   ⚠️ Campaign status is "${campaign.status}", not "running" — skipping`
      );
      return { processed: 0, message: "not-running" };
    }

    const schedule = await CampaignSchedule.findOne({
      campaign_id: campaign._id,
      archived: { $ne: true },
    }).lean();
    const rawTimezone =
      campaign.timezone || schedule?.timezone || process.env.TZ || "UTC";
    const timezone = normalizeTimezone(rawTimezone);
    console.log(
      `   🌍 Timezone: ${rawTimezone}${
        rawTimezone !== timezone ? ` (normalized to ${timezone})` : ""
      }`
    );

    if (schedule) {
      console.log(`   📅 Schedule: ${schedule.name || "Unnamed"}`);
      if (schedule.start_date)
        console.log(
          `      Start: ${moment(schedule.start_date).format("YYYY-MM-DD")}`
        );
      if (schedule.end_date)
        console.log(
          `      End: ${moment(schedule.end_date).format("YYYY-MM-DD")}`
        );
      if (schedule.days?.length > 0)
        console.log(`      Days: ${schedule.days.join(", ")}`);
      if (schedule.from_time && schedule.to_time)
        console.log(`      Time: ${schedule.from_time} - ${schedule.to_time}`);
    } else {
      console.log(`   📅 No schedule found (using default: always active)`);
    }

    if (!isWithinSchedule(schedule, timezone)) {
      console.log(`   ⚠️ Outside schedule window — skipping`);
      return { processed: 0, message: "outside-schedule" };
    }

    const steps = await CampaignSequenceStep.find({ campaign_id: campaign._id })
      .sort({ order: 1 })
      .lean();
    if (!steps || steps.length === 0) {
      console.log(`   ⚠️ No sequence steps found — skipping`);
      return { processed: 0, message: "no-steps" };
    }

    console.log(`   📝 Found ${steps.length} sequence step(s)`);
    const maxStepIndex = steps.length - 1; // Maximum step index (0-based)

    let totalScheduled = 0;
    const results = [];

    for (const step of steps) {
      const variants = await CampaignSequenceVariant.find({
        step_id: step._id,
        campaign_id: campaign._id,
      }).lean();
      console.log(
        `   📦 Step ${step.order} has ${variants?.length || 0} variant(s)`
      );

      const res = await scheduleStepForCampaign(
        campaign,
        schedule,
        step,
        variants
      );
      results.push({
        stepId: step._id.toString(),
        stepOrder: step.order,
        ...res,
      });
      totalScheduled += res.scheduled || 0;

      if (
        campaign.daily_limit &&
        res.todayStats &&
        res.todayStats.totalScheduled >= campaign.daily_limit
      ) {
        console.log(`   ⚠️ Daily limit reached, stopping further steps`);
        break;
      }
    }

    console.log(
      `   ✅ Campaign "${campaign.name}" complete: ${totalScheduled} email(s) scheduled across ${results.length} step(s)`
    );
    return { processed: 1, scheduled: totalScheduled, results };
  } catch (err) {
    console.error(
      `   ❌ Error processing campaign ${campaign.name}:`,
      err.message
    );
    console.error(`   Stack:`, err.stack);
    return { processed: 0, error: err.message };
  }
};

/**
 * Process running campaigns
 */
export const processRunningCampaigns = async () => {
  try {
    // Ensure MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.log("⚠️ MongoDB not connected, attempting to connect...");
      const mongoURI = process.env.MONGO_URI;
      if (mongoURI) {
        await mongoose.connect(mongoURI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        console.log("✅ MongoDB connected successfully");
      } else {
        throw new Error("MONGO_URI is not defined");
      }
    } else {
      console.log("✅ MongoDB connection verified");
    }

    const campaigns = await Campaign.find({
      status: "running",
      archived: { $ne: true },
    }).lean();

    console.log(`\n📧 Found ${campaigns?.length || 0} running campaign(s)`);

    if (!campaigns || campaigns.length === 0) {
      console.log(
        "ℹ️ No running campaigns found. Make sure you have campaigns with status='running' in the database."
      );
      return { success: true, count: 0, message: "No running campaigns found" };
    }

    const out = [];
    for (const c of campaigns) {
      const r = await processCampaign(c);
      out.push({ campaignId: c._id.toString(), campaignName: c.name, ...r });
    }

    const totalScheduled = out.reduce((sum, r) => sum + (r.scheduled || 0), 0);
    console.log(
      `\n📊 Summary: Scheduled ${totalScheduled} email(s) across ${campaigns.length} campaign(s)`
    );

    return {
      success: true,
      count: campaigns.length,
      totalScheduled,
      results: out,
    };
  } catch (err) {
    console.error("❌ Error processing running campaigns:", err);
    console.error("Stack:", err.stack);
    return { success: false, error: err.message };
  }
};

/**
 * Start cron scheduler
 */
export const startCampaignScheduler = (
  cronExpr = process.env.CAMPAIGN_CRON || "*/5 * * * *"
) => {
  console.log(`🕐 Starting campaign scheduler with cron: ${cronExpr}`);

  // Validate cron expression
  if (!cron.validate(cronExpr)) {
    console.error(`❌ Invalid cron expression: ${cronExpr}`);
    console.error("Using default: */5 * * * * (every 5 minutes)");
    cronExpr = "*/5 * * * *";
  }

  // Run immediately on start
  console.log("📊 Running initial campaign check...");
  console.log(
    "ℹ️ Make sure the email worker is running to process scheduled jobs"
  );
  processRunningCampaigns()
    .then((result) => {
      console.log("📊 Initial scheduler run completed:", {
        success: result.success,
        processed: result.count || 0,
        totalScheduled: result.totalScheduled || 0,
        timestamp: new Date().toISOString(),
      });
      if (result.totalScheduled > 0) {
        console.log(
          `✅ ${result.totalScheduled} email(s) scheduled. Worker will process them automatically.`
        );
      }
      if (result.results && result.results.length > 0) {
        result.results.forEach((r) => {
          if (r.scheduled > 0) {
            console.log(
              `  ✅ Scheduled ${r.scheduled} email(s) for campaign "${
                r.campaignName || r.campaignId
              }"`
            );
          } else {
            console.log(
              `  ⚠️ No emails scheduled for campaign "${
                r.campaignName || r.campaignId
              }": ${r.message || "Unknown reason"}`
            );
          }
        });
      }
    })
    .catch((error) => {
      console.error("❌ Error in initial scheduler run:", error);
      console.error("Stack:", error.stack);
    });

  // Schedule cron job
  cron.schedule(
    cronExpr,
    async () => {
      console.log(
        `\n⏰ Running scheduled campaign check at ${new Date().toISOString()}`
      );
      try {
        const result = await processRunningCampaigns();
        console.log("📊 Scheduler result:", {
          success: result.success,
          processed: result.count || 0,
          totalScheduled: result.totalScheduled || 0,
          timestamp: new Date().toISOString(),
        });

        // Log detailed results
        if (result.results && result.results.length > 0) {
          result.results.forEach((r) => {
            if (r.scheduled > 0) {
              console.log(
                `  ✅ Scheduled ${r.scheduled} email(s) for campaign "${
                  r.campaignName || r.campaignId
                }"`
              );
            } else {
              console.log(
                `  ⚠️ No emails scheduled for campaign "${
                  r.campaignName || r.campaignId
                }": ${r.message || "Unknown reason"}`
              );
            }
          });
        } else if (result.message) {
          console.log(`  ℹ️ ${result.message}`);
        }
      } catch (error) {
        console.error("❌ Error in scheduled campaign check:", error);
        console.error("Stack:", error.stack);
      }
    },
    {
      scheduled: true,
      timezone: process.env.TZ || "UTC",
    }
  );

  console.log(`✅ Campaign scheduler started successfully`);
  console.log(`   Schedule: ${cronExpr}`);
  console.log(`   Timezone: ${process.env.TZ || "UTC"}`);
};

export default { processRunningCampaigns, startCampaignScheduler };
