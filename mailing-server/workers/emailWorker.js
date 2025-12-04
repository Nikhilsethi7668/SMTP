// mailing-server/workers/emailWorker.js
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Worker } from "bullmq";

dotenv.config();

// -----------------------------
// MODELS
// -----------------------------
import { EmailWarmup } from "../models/WarmupEmailModel.js";
import Lead from "../models/leadModel.js";
import { Campaign } from "../models/campaignModel.js";

// -----------------------------
// EMAIL SERVICE
// -----------------------------
import { sendEmail } from "../services/emailService.js";

// -----------------------------
// REDIS CONNECTION
// -----------------------------
const redisConnection = process.env.REDIS_URL
  ? { url: process.env.REDIS_URL }
  : {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD || undefined,
  };

console.log("📡 Email Worker connecting to Redis:", redisConnection);

// -----------------------------
// HELPER: RANDOM SEND DELAY
// -----------------------------
const waitRandomDelay = async () => {
  const min = parseInt(process.env.EMAIL_DELAY_MIN_SECONDS || "5", 10);
  const max = parseInt(process.env.EMAIL_DELAY_MAX_SECONDS || "25", 10);
  const sec = Math.floor(Math.random() * (max - min + 1)) + min;

  console.log(`⏳ Waiting ${sec}s before sending email...`);
  await new Promise((resolve) => setTimeout(resolve, sec * 1000));
};

// -----------------------------
// HELPER: ENSURE MONGO CONNECTION
// -----------------------------
const connectMongo = async () => {
  if (mongoose.connection.readyState === 1) return;

  console.log("📡 Connecting MongoDB...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB connected");
};

// -----------------------------
// WORKER PROCESSOR (ROUTER)
// -----------------------------
const processor = async (job) => {
  const data = job.data;

  console.log(`\n---------------------------`);
  console.log(`🎯 Processing job ${job.id}`);
  console.log(`Payload =>`, data);

  await connectMongo();

  // ——————————————————————————————————————————
  // 1️⃣ WARMUP EMAIL PROCESSING
  // ——————————————————————————————————————————
  if (data.warmupEmailId) {
    try {
      console.log(`🔥 Warmup flow triggered for job ${job.id}`);

      const warmup = await EmailWarmup.findById(data.warmupEmailId);
      if (!warmup) throw new Error("Warmup Email not found");
      if (warmup.status !== "active")
        throw new Error(`Warmup status is ${warmup.status}, not active`);

      await waitRandomDelay();

      const result = await sendEmail({
        from: data.from || warmup.email,
        to: data.to,
        subject: data.subject || "Warmup Email",
        text: data.body || "Warmup content",
      });

      warmup.stats.emailsSent += 1;
      warmup.stats.lastActivity = new Date();
      await warmup.save();

      console.log(`✅ Warmup email sent to ${data.to}`);

      return {
        warmup: true,
        success: true,
        sentTo: data.to,
        messageId: result.messageId,
      };
    } catch (err) {
      console.error("❌ Warmup job failed:", err.message);
      throw err;
    }
  }

  // ——————————————————————————————————————————
  // 2️⃣ CAMPAIGN EMAIL PROCESSING
  // ——————————————————————————————————————————
  if (data.campaignId) {
    try {
      console.log(`📨 Campaign flow triggered for job ${job.id}`);
      console.log(`   Campaign ID: ${data.campaignId}`);
      console.log(`   Lead ID: ${data.leadId}`);
      console.log(`   Step ID: ${data.stepId || 'N/A'}`);
      console.log(`   Variant ID: ${data.variantId || 'N/A'}`);

      // Fetch lead + campaign
      const lead = await Lead.findById(data.leadId);
      const campaign = await Campaign.findById(data.campaignId);

      if (!lead) {
        console.error(`   ❌ Lead not found: ${data.leadId}`);
        throw new Error("Lead not found");
      }
      if (!campaign) {
        console.error(`   ❌ Campaign not found: ${data.campaignId}`);
        throw new Error("Campaign not found");
      }

      console.log(`   📧 Lead: ${lead.email}`);
      console.log(`   📋 Campaign: ${campaign.name}`);
      console.log(`   📍 Lead status: ${lead.status}`);
      console.log(`   📍 Lead current_step: ${lead.current_step || 0}`);

      // Skip leads that are not in "Not yet contacted" status
      if (lead.status !== "Not yet contacted") {
        console.log(`   ⚠️ Lead status is "${lead.status}", not "Not yet contacted" — skipping.`);
        return { skipped: true, reason: `Lead status is ${lead.status}` };
      }

      // Skip bounced leads
      if (lead.status === "bounced") {
        console.log("   ⚠️ Lead bounced — skipping.");
        return { skipped: true, reason: "Lead bounced" };
      }

      // Skip if lead already replied (this check is redundant now but kept for safety)
      if (lead.status === "replied") {
        console.log("   ⚠️ Lead already replied — skipping.");
        return { skipped: true, reason: "Already replied" };
      }

      console.log(`   📨 Preparing to send email...`);
      console.log(`      From: ${data.fromEmail || 'N/A'}`);
      console.log(`      To: ${lead.email}`);
      console.log(`      Subject: ${data.subject || 'N/A'}`);
      console.log(`      Body Text: ${data.bodyText ? `${data.bodyText.substring(0, 50)}...` : 'MISSING'}`);
      console.log(`      Body HTML: ${data.bodyHtml ? `${data.bodyHtml.substring(0, 50)}...` : 'N/A'}`);
      console.log(`      Text only: ${data.sendTextOnly ? 'Yes' : 'No'}`);
      console.log(`      Is first email: ${data.isFirstEmail ? 'Yes' : 'No'}`);

      // SCHEDULE DELAY
      await waitRandomDelay();

      // SEND EMAIL
      console.log(`   📤 Sending email...`);
      
      // Ensure text content exists - required by email service
      // If bodyText is missing but bodyHtml exists, use a simple text version
      let emailText = data.bodyText;
      if (!emailText || emailText.trim() === "") {
        if (data.bodyHtml) {
          // Strip HTML tags for a basic text version
          emailText = data.bodyHtml
            .replace(/<[^>]*>/g, "") // Remove HTML tags
            .replace(/&nbsp;/g, " ") // Replace &nbsp; with space
            .replace(/&amp;/g, "&") // Replace &amp; with &
            .replace(/&lt;/g, "<") // Replace &lt; with <
            .replace(/&gt;/g, ">") // Replace &gt; with >
            .replace(/&quot;/g, '"') // Replace &quot; with "
            .trim();
        }
        // If still empty, use a default message
        if (!emailText || emailText.trim() === "") {
          emailText = data.bodyHtml || "Email content";
        }
      }
      
      // Validate required fields before sending
      if (!data.fromEmail) {
        throw new Error("From email address is required");
      }
      if (!data.subject) {
        throw new Error("Email subject is required");
      }
      
      const res = await sendEmail({
        from: data.fromEmail,
        to: lead.email,
        subject: data.subject,
        text: emailText,
        html: data.bodyHtml,
      });

      console.log(`   ✅ Email sent successfully`);
      console.log(`      Message ID: ${res.messageId}`);
      console.log(`      Response: ${res.response || 'N/A'}`);

      // UPDATE LEAD - Mark as contacted after sending email
      await Lead.findByIdAndUpdate(lead._id, {
        $set: { status: "contacted", last_sent_at: new Date() },
        $inc: { sent_count: 1 },
      });
      console.log(`   ✅ Lead updated: status -> "contacted", sent_count incremented`);

      // UPDATE CAMPAIGN METRICS
      // Handle null values: if metrics_sent is null, set it to 1, otherwise increment
      const currentMetricsSent = campaign.metrics_sent;
      if (currentMetricsSent === null || currentMetricsSent === undefined) {
        // Initialize to 1 if null/undefined
        await Campaign.findByIdAndUpdate(campaign._id, {
          $set: { metrics_sent: 1 },
        });
      } else {
        // Increment if it's already a number
        await Campaign.findByIdAndUpdate(campaign._id, {
          $inc: { metrics_sent: 1 },
        });
      }
      console.log(`   ✅ Campaign metrics updated: metrics_sent incremented`);

      console.log(`   📬 Campaign email successfully sent to ${lead.email}`);

      return {
        campaign: true,
        success: true,
        lead: lead.email,
        campaign: campaign.name,
        messageId: res.messageId,
        sentAt: res.sentAt,
      };
    } catch (err) {
      console.error(`   ❌ Campaign job failed: ${err.message}`);
      console.error(`   Stack:`, err.stack);
      throw err;
    }
  }

  // ——————————————————————————————————————————
  // 3️⃣ UNKNOWN JOB TYPE
  // ——————————————————————————————————————————
  console.log("⚠️ Unknown job type:", data);
  return { success: false, error: "Unknown job type" };
};

// -----------------------------
// RUN WORKER
// -----------------------------
export const emailWorker = new Worker("email", processor, {
  connection: redisConnection,
  concurrency: 5,
});

console.log("🚀 Email Worker started...");
console.log("👷 Listening on queue: email");

// -----------------------------
// EVENT LOGGING
// -----------------------------
emailWorker.on("completed", (job, result) => {
  console.log(`✅ Job ${job.id} completed:`, result);
});

emailWorker.on("failed", (job, err) => {
  console.error(`❌ Job ${job.id} failed:`, err.message);
});

emailWorker.on("error", (err) => {
  console.error("❌ Worker error:", err.message);
});

// -----------------------------
// GRACEFUL SHUTDOWN
// -----------------------------
process.on("SIGINT", async () => {
  console.log("🔻 Closing email worker...");
  await emailWorker.close();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  console.log("🔻 Closing email worker...");
  await emailWorker.close();
  process.exit(0);
});

export default emailWorker;
