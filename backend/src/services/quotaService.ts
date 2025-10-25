import { Quota } from "../models/quotaModel.js";
import mongoose from "mongoose";

// ✅ Create quota record for new user
export const createQuota = async (
  user_id: mongoose.Types.ObjectId,
  daily_limit = 1000,
  monthly_limit = 30000,
  rate_limit_per_minute = 60
) => {
  const quota = new Quota({
    user_id,
    daily_limit,
    monthly_limit,
    rate_limit_per_minute,
  });
  await quota.save();
  return quota.toObject();
};

// ✅ Get user quota
export const getQuotaByUserId = async (user_id: mongoose.Types.ObjectId) => {
  return await Quota.findOne({ user_id }).lean();
};

// ✅ Increment usage after each send
export const incrementUsage = async (user_id: mongoose.Types.ObjectId) => {
  await Quota.updateOne(
    { user_id },
    {
      $inc: { emails_sent_today: 1, emails_sent_this_month: 1 },
      $set: { last_sent_at: new Date(), updatedAt: new Date() },
    }
  );
};

// ✅ Reset daily usage (run via cron)
export const resetDailyQuota = async () => {
  const today = new Date();
  await Quota.updateMany(
    { last_reset_date: { $lt: today.toDateString() } },
    { $set: { emails_sent_today: 0, last_reset_date: today, updatedAt: new Date() } }
  );
};

// ✅ Reset monthly usage (run via cron)
export const resetMonthlyQuota = async () => {
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  await Quota.updateMany(
    { last_month_reset: { $lt: startOfMonth } },
    { $set: { emails_sent_this_month: 0, last_month_reset: startOfMonth, updatedAt: new Date() } }
  );
};

// ✅ Check if quota exceeded
export const isQuotaExceeded = async (user_id: mongoose.Types.ObjectId) => {
  const q = await Quota.findOne({ user_id });
  if (!q) return true;
  return (
    q.emails_sent_today >= q.daily_limit ||
    q.emails_sent_this_month >= q.monthly_limit
  );
};

// ✅ Add credits to user quota
export const addCredits = async (user_id: mongoose.Types.ObjectId, newCredits: number) => {
  const updated = await Quota.findOneAndUpdate(
    { user_id },
    { $inc: { credits: newCredits }, $set: { updatedAt: new Date() } },
    { new: true }
  );
  return updated?.toObject();
};

// ✅ Check if user is sending too fast (rate limit)
export const isRateLimitExceeded = async (user_id: mongoose.Types.ObjectId) => {
  const q = await Quota.findOne({ user_id });
  if (!q || !q.last_sent_at) return false;

  const elapsed = (Date.now() - new Date(q.last_sent_at).getTime()) / 1000;
  const interval = 60 / q.rate_limit_per_minute;
  return elapsed < interval;
};
