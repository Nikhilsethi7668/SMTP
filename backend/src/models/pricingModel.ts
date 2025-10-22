import { pool } from "../config/db.js";

// Initialize the pricing table
export const initPricingTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pricing (
      id SERIAL PRIMARY KEY,
      rupees INTEGER NOT NULL,
      credits INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Seed with a default value if the table is empty
  const { rows } = await pool.query('SELECT COUNT(*) FROM pricing');
  if (rows[0].count === '0') {
    await pool.query('INSERT INTO pricing (rupees, credits) VALUES (1, 10)');
  }
};

// Get the current pricing
export const getPricing = async () => {
  const { rows } = await pool.query('SELECT * FROM pricing ORDER BY id DESC LIMIT 1');
  return rows[0];
};

// Set the pricing (for admin)
export const setPricing = async (rupees: number, credits: number) => {
  const { rows } = await pool.query(
    'INSERT INTO pricing (rupees, credits) VALUES ($1, $2) RETURNING *',
    [rupees, credits]
  );
  return rows[0];
};
