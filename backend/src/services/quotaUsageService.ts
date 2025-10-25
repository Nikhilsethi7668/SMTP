import { QuotaUsage } from "../models/quotaUsageModel.js";
import mongoose from "mongoose";

// ✅ Increment daily usage (UPSERT style)
export const incrementDailyUsage = async (
  user_id: mongoose.Types.ObjectId,
  count: number = 1
) => {
  const today = new Date(new Date().toDateString()); // ensures date without time

  await QuotaUsage.updateOne(
    { user_id, date: today },
    {
      $inc: { emails_sent: count },
      $set: { updatedAt: new Date() },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true }
  );
};

// ✅ Get daily usage (default: today)
export const getDailyUsage = async (
  user_id: mongoose.Types.ObjectId,
  date: string = ""
) => {
  const targetDate = date ? new Date(date) : new Date(new Date().toDateString());
  const record = await QuotaUsage.findOne({ user_id, date: targetDate }).lean();
  return record || { emails_sent: 0 };
};

// ✅ Fetch usage history for user
export const getUsageHistory = async (
  user_id: mongoose.Types.ObjectId,
  limit: number = 30
) => {
  return await QuotaUsage.find({ user_id })
    .sort({ date: -1 })
    .limit(limit)
    .lean();
};

// ✅ Delete old quota usage (cleanup)
export const deleteOldUsage = async (days: number = 90) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  await QuotaUsage.deleteMany({ date: { $lt: cutoff } });
};
