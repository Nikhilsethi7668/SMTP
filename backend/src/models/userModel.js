import { pool } from "../config/db.js";
import bcrypt from "bcrypt";

// ✅ Initialize table
export const initUserTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      org_id INTEGER,
      username VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'user', -- admin | user
      email VARCHAR(150),
      daily_quota INTEGER DEFAULT 1000,
      monthly_quota INTEGER DEFAULT 10000,
      used_today INTEGER DEFAULT 0,
      used_month INTEGER DEFAULT 0,
      rate_limit INTEGER DEFAULT 5, -- emails per second
      dedicated_ip_id INTEGER,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
};

// ✅ CRUD OPERATIONS

// Create user with hashed password
export const createUser = async (userData) => {
  const {
    org_id,
    username,
    password,
    email,
    role,
    daily_quota,
    monthly_quota,
    rate_limit,
    dedicated_ip_id,
  } = userData;

  const hash = await bcrypt.hash(password, 10);

  const query = `
    INSERT INTO users (
      org_id, username, password_hash, email, role, daily_quota, monthly_quota,
      rate_limit, dedicated_ip_id
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING id, username, email, role;
  `;

  const { rows } = await pool.query(query, [
    org_id,
    username,
    hash,
    email,
    role,
    daily_quota,
    monthly_quota,
    rate_limit,
    dedicated_ip_id,
  ]);
  return rows[0];
};

// Get user by username (used for SMTP auth & admin login)
export const getUserByUsername = async (username) => {
  const { rows } = await pool.query(`SELECT * FROM users WHERE username=$1`, [
    username,
  ]);
  return rows[0];
};

// Validate password
export const validatePassword = async (username, password) => {
  const user = await getUserByUsername(username);
  if (!user) return false;
  return (await bcrypt.compare(password, user.password_hash)) ? user : false;
};

// Update usage quotas
export const updateUsage = async (username, count = 1) => {
  await pool.query(
    `
    UPDATE users
    SET used_today = used_today + $1,
        used_month = used_month + $1,
        updated_at = NOW()
    WHERE username = $2;
  `,
    [count, username]
  );
};

// Reset daily usage (run by cron/worker)
export const resetDailyUsage = async () => {
  await pool.query(`UPDATE users SET used_today = 0;`);
};

// Reset monthly usage (run by cron/worker)
export const resetMonthlyUsage = async () => {
  await pool.query(`UPDATE users SET used_month = 0;`);
};

// Delete user
export const deleteUser = async (id) => {
  await pool.query(`DELETE FROM users WHERE id=$1`, [id]);
};

// List all users (admin panel)
export const getAllUsers = async () => {
  const { rows } = await pool.query(`
    SELECT id, username, email, role, daily_quota, monthly_quota,
           used_today, used_month, rate_limit, is_active, created_at
    FROM users
    ORDER BY id ASC;
  `);
  return rows;
};
