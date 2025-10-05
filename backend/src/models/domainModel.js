import { pool } from "../config/db.js";

// ✅ Initialize the domain table
export const initDomainTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS domains (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,   -- domain owner
      domain_name VARCHAR(255) UNIQUE NOT NULL,                 -- e.g. example.com
      dkim_selector VARCHAR(50) DEFAULT 'default',              -- DKIM selector name
      dkim_public_key TEXT,                                     -- for DNS TXT
      dkim_private_key TEXT,                                    -- stored securely (optional encrypted)
      spf_record TEXT,                                          -- e.g. "v=spf1 include:_spf.relay.example.com ~all"
      dmarc_record TEXT,                                        -- e.g. "v=DMARC1; p=quarantine;"
      verified BOOLEAN DEFAULT false,                           -- DNS verification state
      last_verified_at TIMESTAMP,                               -- last check timestamp
      status VARCHAR(20) DEFAULT 'pending',                     -- pending | verified | failed | disabled
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
};

// ✅ Add a new sending domain
export const addDomain = async (data) => {
  const {
    user_id,
    domain_name,
    dkim_selector,
    dkim_public_key,
    dkim_private_key,
    spf_record,
    dmarc_record,
  } = data;

  const { rows } = await pool.query(
    `INSERT INTO domains (
      user_id, domain_name, dkim_selector, dkim_public_key, dkim_private_key, spf_record, dmarc_record
     ) VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *;`,
    [user_id, domain_name, dkim_selector, dkim_public_key, dkim_private_key, spf_record, dmarc_record]
  );
  return rows[0];
};

// ✅ Get all domains for an admin or a user
export const getDomains = async (user_id = null) => {
  if (user_id) {
    const { rows } = await pool.query(`SELECT * FROM domains WHERE user_id=$1 ORDER BY id ASC;`, [user_id]);
    return rows;
  } else {
    const { rows } = await pool.query(`SELECT * FROM domains ORDER BY id ASC;`);
    return rows;
  }
};

// ✅ Verify domain (used after DNS check via worker or API)
export const markDomainVerified = async (domain_id) => {
  await pool.query(
    `UPDATE domains
     SET verified=true, status='verified', last_verified_at=NOW(), updated_at=NOW()
     WHERE id=$1;`,
    [domain_id]
  );
};

// ✅ Disable or suspend a domain
export const disableDomain = async (domain_id) => {
  await pool.query(
    `UPDATE domains SET status='disabled', updated_at=NOW() WHERE id=$1;`,
    [domain_id]
  );
};

// ✅ Update DKIM/SPF/DMARC records
export const updateDomainRecords = async (domain_id, updates) => {
  const { dkim_public_key, spf_record, dmarc_record } = updates;
  await pool.query(
    `UPDATE domains
     SET dkim_public_key=$1, spf_record=$2, dmarc_record=$3, updated_at=NOW()
     WHERE id=$4;`,
    [dkim_public_key, spf_record, dmarc_record, domain_id]
  );
};
