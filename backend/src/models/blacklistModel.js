import { pool } from "../config/db.js";

// ✅ Initialize blacklist table
export const initBlacklistTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS blacklists (
      id SERIAL PRIMARY KEY,
      type VARCHAR(20) NOT NULL,      -- 'domain' | 'ip' | 'keyword'
      value VARCHAR(255) NOT NULL,    -- e.g., "spamdomain.com" or "1.2.3.4" or "buy now"
      reason TEXT,                     -- optional reason
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
};

// ✅ Add new blacklist entry
export const addBlacklistEntry = async (type, value, reason = null) => {
  const { rows } = await pool.query(
    `INSERT INTO blacklists (type, value, reason)
     VALUES ($1,$2,$3)
     RETURNING *;`,
    [type, value, reason]
  );
  return rows[0];
};

// ✅ Check if a value is blacklisted
export const isBlacklisted = async (type, value) => {
  const { rows } = await pool.query(
    `SELECT * FROM blacklists WHERE type=$1 AND value=$2 LIMIT 1;`,
    [type, value]
  );
  return rows.length > 0;
};

// ✅ Fetch all blacklist entries (optional filtering by type)
export const getBlacklist = async (type = null) => {
  if (type) {
    const { rows } = await pool.query(
      `SELECT * FROM blacklists WHERE type=$1 ORDER BY created_at DESC;`,
      [type]
    );
    return rows;
  } else {
    const { rows } = await pool.query(
      `SELECT * FROM blacklists ORDER BY created_at DESC;`
    );
    return rows;
  }
};

// ✅ Remove blacklist entry
export const removeBlacklistEntry = async (id) => {
  await pool.query(
    `DELETE FROM blacklists WHERE id=$1;`,
    [id]
  );
};
