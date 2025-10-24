import { pool } from "../config/db.js";

// Initialize the 'keys' table
export const initKeyTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS keys (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      key VARCHAR(255) UNIQUE NOT NULL,
      rate_limit INTEGER, -- Optional: specific rate limit for this key
      expires_at TIMESTAMP,
      last_used_at TIMESTAMP,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
};

// CRUD OPERATIONS

// Create a new API key
export const createKey = async (keyData: { user_id: number; key: string; permissions?: string; rate_limit?: number; expires_at?: Date }) => {
  const {
    user_id,
    key,
    permissions = 'send',
    rate_limit,
    expires_at,
  } = keyData;

  const query = `
    INSERT INTO keys (user_id, key, permissions, rate_limit, expires_at)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, key, user_id, permissions, is_active, expires_at;
  `;

  const { rows } = await pool.query(query, [
    user_id,
    key,
    permissions,
    rate_limit,
    expires_at,
  ]);
  return rows[0];
};

// Get a key by its value
export const getKeyByKey = async (key: string) => {
  const { rows } = await pool.query(`SELECT * FROM keys WHERE key = $1 AND is_active = TRUE`, [key]);
  return rows[0];
};

// Get all keys for a specific user
export const getKeysByUserId = async (user_id: number) => {
  const { rows } = await pool.query(`SELECT id, key, permissions, rate_limit, expires_at, last_used_at, is_active, created_at FROM keys WHERE user_id = $1`, [user_id]);
  return rows;
};

// Update key's last used timestamp
export const updateKeyUsage = async (key: string) => {
  await pool.query(
    `UPDATE keys SET last_used_at = NOW() WHERE key = $1`,
    [key]
  );
};

// Deactivate a key
export const deactivateKey = async (id: number, user_id: number) => {
    const { rows } = await pool.query(
        `UPDATE keys SET is_active = FALSE, updated_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING id`,
        [id, user_id]
    );
    return rows[0];
};

// Delete a key
export const deleteKey = async (id: number, user_id: number) => {
  await pool.query(`DELETE FROM keys WHERE id = $1 AND user_id = $2`, [id, user_id]);
};
