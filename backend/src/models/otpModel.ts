import { pool } from "../config/db.js";

export const initOtpTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS otps (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      otp VARCHAR(10) NOT NULL,
      purpose VARCHAR(50) NOT NULL, -- 'registration', 'password_reset', '2fa', etc.
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      CONSTRAINT unique_active_otp_per_email_per_purpose 
        UNIQUE(email, purpose) 
        WHERE (expires_at > NOW())
    );
  `);
};

// Generate a new OTP for an email
export const generateOtp = async (email: string, purpose: string, expiryMinutes = 15) => {
  // Generate a random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Calculate expiry time
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + expiryMinutes);

  // Delete any existing OTPs for this email and purpose
  await pool.query(
    `DELETE FROM otps 
     WHERE email = $1 AND purpose = $2`,
    [email, purpose]
  );

  // Store the new OTP
  const { rows } = await pool.query(
    `INSERT INTO otps (email, otp, purpose, expires_at)
     VALUES ($1, $2, $3, $4)
     RETURNING id, otp, expires_at`,
    [email, otp, purpose, expiresAt]
  );

  return {
    id: rows[0].id,
    otp: rows[0].otp,
    expiresAt: rows[0].expires_at
  };
};

// Verify and consume an OTP
export const verifyOtpService = async (email: string, otp: string, purpose: string) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Find and lock the OTP row
    const { rows } = await client.query(
      `SELECT * FROM otps 
       WHERE email = $1 
       AND otp = $2 
       AND purpose = $3 
       AND expires_at > NOW()
       FOR UPDATE`,
      [email, otp, purpose]
    );

    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return { isValid: false, message: 'Invalid or expired OTP' };
    }

    // Delete the OTP since it's single-use
    await client.query(
      'DELETE FROM otps WHERE id = $1',
      [rows[0].id]
    );
    
    await client.query('COMMIT');
    
    return { 
      isValid: true, 
      message: 'OTP verified successfully',
      otpRecord: rows[0]
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Clean up expired OTPs (to be called by a scheduled job)
export const cleanupExpiredOtps = async () => {
  await pool.query(
    `DELETE FROM otps 
     WHERE expires_at <= NOW() - INTERVAL '1 day'`
  );
};

// Check if an email has an active OTP for a specific purpose
export const hasActiveOtp = async (email: string, purpose: string) => {
  const { rows } = await pool.query(
    `SELECT id FROM otps 
     WHERE email = $1 
     AND purpose = $2 
     AND expires_at > NOW()`,
    [email, purpose]
  );
  return rows.length > 0;
};