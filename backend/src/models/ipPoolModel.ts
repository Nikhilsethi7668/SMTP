import { pool } from "../config/db.js";

// ✅ Initialize table
export const initIPPoolTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ip_pools (
      id SERIAL PRIMARY KEY,
      label VARCHAR(100) NOT NULL,              -- e.g. "marketing", "transactional"
      ip_address INET UNIQUE NOT NULL,          -- IPv4 or IPv6
      status VARCHAR(20) DEFAULT 'active',      -- active | warming | blocked
      warmup_stage INTEGER DEFAULT 1,           -- stage of warmup
      max_daily_send INTEGER DEFAULT 5000,      -- current warmup cap
      assigned_user_id INTEGER,                 -- if dedicated
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
};

// ✅ Create a new IP record
export const addIP = async (data: any) => {
  const { label, ip_address, status, warmup_stage, max_daily_send, assigned_user_id } = data;
  const { rows } = await pool.query(
    `INSERT INTO ip_pools (label, ip_address, status, warmup_stage, max_daily_send, assigned_user_id)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING *;`,
    [label, ip_address, status, warmup_stage, max_daily_send, assigned_user_id]
  );
  return rows[0];
};

// ✅ Fetch all IPs
export const getAllIPs = async () => {
  const { rows } = await pool.query(`SELECT * FROM ip_pools ORDER BY id ASC;`);
  return rows;
};

// ✅ Get next available IP for rotation
export const getNextAvailableIP = async () => {
  const { rows } = await pool.query(`
    SELECT * FROM ip_pools
    WHERE status='active' AND assigned_user_id IS NULL
    ORDER BY RANDOM()
    LIMIT 1;
  `);
  return rows[0];
};

// ✅ Assign IP to a user
export const assignIPToUser = async (ip_id: number, user_id: number) => {
  await pool.query(
    `UPDATE ip_pools SET assigned_user_id=$1, updated_at=NOW() WHERE id=$2;`,
    [user_id, ip_id]
  );
};

// ✅ Rotate IP (used in warm-up schedule)
export const rotateIPStatus = async (ip_id: number, newStatus: string) => {
  await pool.query(
    `UPDATE ip_pools SET status=$1, updated_at=NOW() WHERE id=$2;`,
    [newStatus, ip_id]
  );
};

// ✅ Update warm-up stage and cap
export const updateWarmup = async (ip_id: number, stage: number, max_daily_send: number) => {
  await pool.query(
    `UPDATE ip_pools SET warmup_stage=$1, max_daily_send=$2, updated_at=NOW() WHERE id=$3;`,
    [stage, max_daily_send, ip_id]
  );
};
