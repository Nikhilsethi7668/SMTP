import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

import { startScheduler as startWarmupScheduler } from "./services/warmupScheduler.js";
import { startCampaignScheduler } from "./services/campaignScheduler.js";

dotenv.config();

// Connect DB
connectDB().catch((err) => {
  console.error("MongoDB connection failed:", err);
  process.exit(1);
});

console.log("🚀 Mailing Server Started");

// Warmup Scheduler (every 15 mins)
const warmupCron = process.env.WARMUP_CRON || "*/15 * * * *";
startWarmupScheduler(warmupCron);

// Campaign Scheduler (every 5 mins)
const campaignCron = process.env.CAMPAIGN_CRON || "*/5 * * * *";
startCampaignScheduler(campaignCron);

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("⛔ SIGTERM received, shutting down...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("⛔ SIGINT received, shutting down...");
  process.exit(0);
});
