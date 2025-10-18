import {
  getQuotaByUserId,
  incrementUsage,
  isQuotaExceeded,
  isRateLimitExceeded,
  resetDailyQuota,
  resetMonthlyQuota,
} from "../models/quotaModel.js";

import {
  incrementDailyUsage,
  getDailyUsage,
} from "../models/quotaUsageModel.js";

/**
 * Check if user can send an email
 * Returns { allowed: boolean, reason?: string }
 */
export const checkUserQuota = async (user_id: number) => {
  // Step 1: Check if quota exceeded
  const quotaExceeded = await isQuotaExceeded(user_id);
  if (quotaExceeded) {
    return { allowed: false, reason: "Quota exceeded" };
  }

  // Step 2: Check rate limit
  const rateExceeded = await isRateLimitExceeded(user_id);
  if (rateExceeded) {
    return { allowed: false, reason: "Rate limit exceeded" };
  }

  return { allowed: true };
};

/**
 * Increment usage for a user after sending an email
 * Updates both quotas table and quota_usage table (historical)
 */
export const recordEmailSent = async (user_id: number, count = 1) => {
  await incrementUsage(user_id);             // Update current quota counters
  await incrementDailyUsage(user_id, count); // Update historical usage
};

/**
 * Admin or worker: reset daily quotas
 */
export const resetDailyQuotas = async () => {
  await resetDailyQuota();
};

/**
 * Admin or worker: reset monthly quotas
 */
export const resetMonthlyQuotas = async () => {
  await resetMonthlyQuota();
};

/**
 * Get current usage and limits for a user
 */
export const getUserQuotaStatus = async (user_id: number) => {
  const quota = await getQuotaByUserId(user_id);
  const usage = await getDailyUsage(user_id);

  return {
    daily_limit: quota.daily_limit,
    monthly_limit: quota.monthly_limit,
    sent_today: usage.emails_sent || quota.emails_sent_today,
    sent_this_month: quota.emails_sent_this_month,
    rate_limit_per_minute: quota.rate_limit_per_minute,
  };
};
