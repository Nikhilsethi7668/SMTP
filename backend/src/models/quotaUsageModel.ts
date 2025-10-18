import { pool } from "../config/db.js";

// ✅ Initialize quota usage table
export const initQuotaUsageTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS quota_usages (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      date DATE NOT NULL DEFAULT CURRENT_DATE,   -- tracks per day
      emails_sent INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, date)
    );
  `);
};

// ✅ Increment daily usage for a user
export const incrementDailyUsage = async (user_id: number, count: number = 1) => {
  // Use UPSERT to handle first-time usage
  await pool.query(`
    INSERT INTO quota_usages (user_id, emails_sent)
    VALUES ($1, $2)
    ON CONFLICT (user_id, date)
    DO UPDATE SET emails_sent = quota_usages.emails_sent + $2,
                  updated_at = NOW();
  `, [user_id, count]);
};

// ✅ Get usage for a specific user on a specific date
export const getDailyUsage = async (user_id: number, date: string = "") => {
  const targetDate = date || new Date().toISOString().split('T')[0];
  const { rows } = await pool.query(
    `SELECT * FROM quota_usages WHERE user_id=$1 AND date=$2 LIMIT 1;`,
    [user_id, targetDate]
  );
  return rows[0] || { emails_sent: 0 };
};

// ✅ Fetch usage history for a user
export const getUsageHistory = async (user_id: number, limit: number = 30) => {
  const { rows } = await pool.query(
    `SELECT * FROM quota_usages WHERE user_id=$1 ORDER BY date DESC LIMIT $2;`,
    [user_id, limit]
  );
  return rows;
};

// ✅ Reset old quota usage (optional cleanup)
export const deleteOldUsage = async (days: number = 90) => {
  await pool.query(
    `DELETE FROM quota_usages WHERE date < NOW() - INTERVAL '${days} days';`
  );
};
