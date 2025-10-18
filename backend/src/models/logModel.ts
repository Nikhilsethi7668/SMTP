import { pool } from "../config/db.js";

// ✅ Initialize log table
export const initLogTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      sender_email VARCHAR(255) NOT NULL,
      recipient_email VARCHAR(255) NOT NULL,
      subject VARCHAR(255),
      status VARCHAR(50) DEFAULT 'pending',       -- pending | sent | rejected | deferred | failed
      ip_address INET,                            -- IP used to send
      reason TEXT,                                -- optional rejection/defer reason
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
};

// ✅ Add a log entry
export const addLog = async (data: any) => {
  const { user_id, sender_email, recipient_email, subject, status, ip_address, reason } = data;
  const { rows } = await pool.query(
    `INSERT INTO logs (user_id, sender_email, recipient_email, subject, status, ip_address, reason)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *;`,
    [user_id, sender_email, recipient_email, subject, status, ip_address, reason]
  );
  return rows[0];
};

// ✅ Fetch logs (optionally by user)
export const getLogs = async (user_id: number | null = null, limit: number = 100) => {
  if (user_id) {
    const { rows } = await pool.query(
      `SELECT * FROM logs WHERE user_id=$1 ORDER BY created_at DESC LIMIT $2;`,
      [user_id, limit]
    );
    return rows;
  } else {
    const { rows } = await pool.query(
      `SELECT * FROM logs ORDER BY created_at DESC LIMIT $1;`,
      [limit]
    );
    return rows;
  }
};

// ✅ Fetch logs by status (sent, rejected, deferred, failed)
export const getLogsByStatus = async (status: string, limit: number = 100) => {
  const { rows } = await pool.query(
    `SELECT * FROM logs WHERE status=$1 ORDER BY created_at DESC LIMIT $2;`,
    [status, limit]
  );
  return rows;
};

// ✅ Delete old logs (cleanup)
export const deleteOldLogs = async (days: number = 30) => {
  await pool.query(
    `DELETE FROM logs WHERE created_at < NOW() - INTERVAL '${days} days';`
  );
};
