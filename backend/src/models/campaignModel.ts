import { pool } from "../config/db.js";

// Initialize campaigns table
export const initCampaignTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS campaigns (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(50) DEFAULT 'marketing',
      from_name VARCHAR(255),
      from_email VARCHAR(255) NOT NULL,
      reply_to VARCHAR(255),
      subject TEXT NOT NULL,

      send_at TIMESTAMP,
      started_at TIMESTAMP,
      finished_at TIMESTAMP,
      timezone VARCHAR(100) DEFAULT 'Asia/Kolkata',

      ip_pool VARCHAR(255) DEFAULT 'shared',
      rate_limit INTEGER DEFAULT 5,
      daily_quota INTEGER DEFAULT 10000,

      metrics_sent INTEGER DEFAULT 0,
      metrics_delivered INTEGER DEFAULT 0,
      metrics_opened INTEGER DEFAULT 0,
      metrics_clicked INTEGER DEFAULT 0,
      metrics_bounced INTEGER DEFAULT 0,
      metrics_complaints INTEGER DEFAULT 0,

      status VARCHAR(50) DEFAULT 'draft',
      priority INTEGER DEFAULT 0,
      archived BOOLEAN DEFAULT false,

      delivery_log_collection VARCHAR(255),

      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
};

// Add a new campaign
export const addCampaign = async (data: any) => {
  const {
    user_id,
    name,
    type,
    from_name,
    from_email,
    reply_to,
    subject,
    send_at,
    timezone,
    ip_pool,
    rate_limit,
    daily_quota,
    status,
    priority,
    delivery_log_collection,
  } = data;

  const { rows } = await pool.query(
    `INSERT INTO campaigns (
      user_id, name, type, from_name, from_email, reply_to, subject,
      send_at, timezone, ip_pool, rate_limit, daily_quota, status, priority, delivery_log_collection
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
    RETURNING *;`,
    [
      user_id,
      name,
      type,
      from_name,
      from_email,
      reply_to,
      subject,
      send_at,
      timezone,
      ip_pool,
      rate_limit,
      daily_quota,
      status,
      priority,
      delivery_log_collection,
    ]
  );
  return rows[0];
};

// Get campaigns (all or by user)
export const getCampaigns = async (user_id: number | null = null) => {
  if (user_id) {
    const { rows } = await pool.query(`SELECT * FROM campaigns WHERE user_id=$1 ORDER BY id ASC;`, [user_id]);
    return rows;
  } else {
    const { rows } = await pool.query(`SELECT * FROM campaigns ORDER BY id ASC;`);
    return rows;
  }
};

export const getCampaignById = async (campaign_id: number) => {
  const { rows } = await pool.query(`SELECT * FROM campaigns WHERE id=$1;`, [campaign_id]);
  return rows[0];
};

export const updateCampaign = async (campaign_id: number, updates: any) => {
  // Build a simple SET clause from provided keys
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;
  for (const key of Object.keys(updates)) {
    fields.push(`${key}=$${idx}`);
    values.push((updates as any)[key]);
    idx++;
  }
  if (fields.length === 0) return;
  values.push(campaign_id);
  const q = `UPDATE campaigns SET ${fields.join(", ")}, updated_at=NOW() WHERE id=$${idx} RETURNING *;`;
  const { rows } = await pool.query(q, values);
  return rows[0];
};

export const markCampaignStatus = async (campaign_id: number, status: string) => {
  await pool.query(`UPDATE campaigns SET status=$1, updated_at=NOW() WHERE id=$2;`, [status, campaign_id]);
};

export const incrementMetric = async (campaign_id: number, metric: string, by: number = 1) => {
  const allowed = [
    'metrics_sent',
    'metrics_delivered',
    'metrics_opened',
    'metrics_clicked',
    'metrics_bounced',
    'metrics_complaints',
  ];
  if (!allowed.includes(metric)) throw new Error('Invalid metric');
  const q = `UPDATE campaigns SET ${metric} = COALESCE(${metric},0) + $1, updated_at=NOW() WHERE id=$2 RETURNING ${metric};`;
  const { rows } = await pool.query(q, [by, campaign_id]);
  return rows[0];
};

export const archiveCampaign = async (campaign_id: number, archived: boolean = true) => {
  await pool.query(`UPDATE campaigns SET archived=$1, updated_at=NOW() WHERE id=$2;`, [archived, campaign_id]);
};

export const deleteCampaign = async (campaign_id: number) => {
  await pool.query(`DELETE FROM campaigns WHERE id=$1;`, [campaign_id]);
};

export default {
  initCampaignTable,
  addCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  markCampaignStatus,
  incrementMetric,
  archiveCampaign,
  deleteCampaign,
};