import { pool } from "../config/db.js";

// ✅ Initialize the quota table
export const initQuotaTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS quotas (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      daily_limit INTEGER DEFAULT 1000,                -- max per day
      monthly_limit INTEGER DEFAULT 30000,             -- max per month
      credits INTEGER DEFAULT 0,                       -- purchased credits
      emails_sent_today INTEGER DEFAULT 0,
      emails_sent_this_month INTEGER DEFAULT 0,
      last_reset_date DATE DEFAULT CURRENT_DATE,
      last_month_reset DATE DEFAULT DATE_TRUNC('month', CURRENT_DATE),
      rate_limit_per_minute INTEGER DEFAULT 60,        -- e.g., 60 emails/minute
      last_sent_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
};

// ✅ Create quota record for new user
export const createQuota = async (user_id: number, daily_limit = 1000, monthly_limit = 30000, rate_limit_per_minute = 60) => {
  const { rows } = await pool.query(
    `INSERT INTO quotas (user_id, daily_limit, monthly_limit, rate_limit_per_minute)
     VALUES ($1,$2,$3,$4)
     RETURNING *;`,
    [user_id, daily_limit, monthly_limit, rate_limit_per_minute]
  );
  return rows[0];
};

// ✅ Get user quota
export const getQuotaByUserId = async (user_id: number) => {
  const { rows } = await pool.query(`SELECT * FROM quotas WHERE user_id=$1 LIMIT 1;`, [user_id]);
  return rows[0];
};

// ✅ Update usage after each send
export const incrementUsage = async (user_id: number) => {
  await pool.query(`
    UPDATE quotas
    SET emails_sent_today = emails_sent_today + 1,
        emails_sent_this_month = emails_sent_this_month + 1,
        last_sent_at = NOW(),
        updated_at = NOW()
    WHERE user_id=$1;
  `, [user_id]);
};

// ✅ Reset daily usage (run via cron or worker)
export const resetDailyQuota = async () => {
  await pool.query(`
    UPDATE quotas
    SET emails_sent_today=0, last_reset_date=CURRENT_DATE, updated_at=NOW()
    WHERE last_reset_date < CURRENT_DATE;
  `);
};

// ✅ Reset monthly usage
export const resetMonthlyQuota = async () => {
  await pool.query(`
    UPDATE quotas
    SET emails_sent_this_month=0, last_month_reset=DATE_TRUNC('month', CURRENT_DATE), updated_at=NOW()
    WHERE last_month_reset < DATE_TRUNC('month', CURRENT_DATE);
  `);
};

// ✅ Check if user exceeds daily or monthly quota
export const isQuotaExceeded = async (user_id: number) => {
  const { rows } = await pool.query(
    `SELECT * FROM quotas WHERE user_id=$1;`,
    [user_id]
  );
  const q = rows[0];
  if (!q) return true;

  return (
    q.emails_sent_today >= q.daily_limit ||
    q.emails_sent_this_month >= q.monthly_limit
  );
};

// ✅ Check if user is sending too fast (rate limit)
// ✅ Add credits to user's quota
export const addCredits = async (user_id: number, newCredits: number) => {
  const { rows } = await pool.query(
    `UPDATE quotas
     SET credits = credits + $2, updated_at = NOW()
     WHERE user_id = $1
     RETURNING *;`,
    [user_id, newCredits]
  );
  return rows[0];
};

// ✅ Check if user is sending too fast (rate limit)
export const isRateLimitExceeded = async (user_id: number) => {
  const { rows } = await pool.query(
    `SELECT last_sent_at, rate_limit_per_minute FROM quotas WHERE user_id=$1;`,
    [user_id]
  );
  const q = rows[0];
  if (!q || !q.last_sent_at) return false;

  const elapsed = (Date.now() - new Date(q.last_sent_at).getTime()) / 1000;
  const interval = 60 / q.rate_limit_per_minute;
  return elapsed < interval;
};
