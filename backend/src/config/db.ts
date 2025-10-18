// src/config/db.js
import dotenv from 'dotenv';
import pkg from 'pg';

dotenv.config(); // Load environment variables from .env

const { Pool } = pkg;

// Create a new Postgres pool
export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST || '127.0.0.1',
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD), // ensure it's a string
  port: parseInt(process.env.DB_PORT!, 10) || 5432,
});

// Handle errors globally
pool.on('error', (err) => {
  console.error('Unexpected Postgres error:', err);
});

// Optional: test the connection immediately
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Postgres connected successfully');
    client.release();
  } catch (err) {
    console.error('❌ Error connecting to Postgres:', err);
  }
};
