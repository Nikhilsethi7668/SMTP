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
      refresh_token TEXT,
      refresh_token_expires_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
};

// ✅ CRUD OPERATIONS

// Create user with hashed password
export const createUser = async (userData: any) => {
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
export const getUserByUsername = async (username: string) => {
  const { rows } = await pool.query(`SELECT * FROM users WHERE username=$1`, [
    username,
  ]);
  return rows[0];
};

// Get user by email (used for SMTP auth & admin login)
export const getUserByEmail = async (email: string) => {
  const { rows } = await pool.query(`SELECT * FROM users WHERE email=$1`, [
    email,
  ]);
  return rows[0];
};

// Validate password
export const validatePassword = async (email: string, password: string) => {
  const user = await getUserByEmail(email);
  if (!user) return false;
  return (await bcrypt.compare(password, user.password_hash)) ? user : false;
};

// Update usage quotas
export const updateUsage = async (username: string, count = 1) => {
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
export const deleteUser = async (id: number) => {
  await pool.query(`DELETE FROM users WHERE id=$1`, [id]);
};

export const markUserAsVerified = async (email: string) => {
  const { rows } = await pool.query(
    `UPDATE users 
     SET is_verified = TRUE, updated_at = NOW() 
     WHERE email = $1
     RETURNING id, username, email, is_verified`,
    [email]
  );
  return rows[0];
};

export const isUserVerified = async (email: string) => {
  const { rows } = await pool.query(
    'SELECT is_verified FROM users WHERE email = $1',
    [email]
  );
  return rows[0]?.is_verified || false;
};

// List all users (admin panel)
export const getAllUsers = async () => {
  const { rows } = await pool.query(`
    SELECT id, username, email, role, daily_quota, monthly_quota,
           used_today, used_month, rate_limit, is_active, is_verified,
           created_at, updated_at
    FROM users
  `);
  return rows;
};

export const updateRefreshToken = async (email: string, refreshToken: string, expiresAt: Date) => {
  const { rows } = await pool.query(
    `UPDATE users 
     SET refresh_token = $1, 
         refresh_token_expires_at = $2,
         updated_at = NOW()
     WHERE email = $3
     RETURNING id, email, username, role`,
    [refreshToken, expiresAt, email]
  );
  return rows[0];
};

// Find user by refresh token
export const findByRefreshToken = async (token: string) => {
  const { rows } = await pool.query(
    `SELECT * FROM users 
     WHERE refresh_token = $1 
     AND refresh_token_expires_at > NOW()`,
    [token]
  );
  return rows[0];
};
