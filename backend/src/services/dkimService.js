import crypto from "crypto";
import fs from "fs";
import path from "path";
import { pool } from "../models/db.js";

/**
 * Generate DKIM keypair for a domain
 * @param {string} selector - DKIM selector (e.g., 'default')
 * @param {string} domain - domain name
 */
export const generateDKIMKeys = async (selector, domain) => {
  // Generate 2048-bit RSA key pair
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "pkcs1", format: "pem" },
    privateKeyEncoding: { type: "pkcs1", format: "pem" },
  });

  return { selector, domain, publicKey, privateKey };
};

/**
 * Save DKIM keys to database
 * Optionally save private key securely to file system
 */
export const saveDKIMKeys = async (domain_id, publicKey, privateKey) => {
  await pool.query(
    `UPDATE domains
     SET dkim_public_key=$1, dkim_private_key=$2, updated_at=NOW()
     WHERE id=$3;`,
    [publicKey, privateKey, domain_id]
  );
};

/**
 * Generate DKIM DNS TXT record string
 * Example: "v=DKIM1; k=rsa; p=<publicKeyBase64>"
 */
export const generateDKIMDNSRecord = (publicKey) => {
  // Remove headers/footers and newlines
  const pubKeyClean = publicKey
    .replace(/-----BEGIN PUBLIC KEY-----/g, "")
    .replace(/-----END PUBLIC KEY-----/g, "")
    .replace(/\n/g, "");

  return `v=DKIM1; k=rsa; p=${pubKeyClean}`;
};

/**
 * Verify DKIM setup (optional: DNS lookup)
 * Can be extended to check TXT record via dns.resolveTxt()
 */
export const verifyDKIM = async (domain, selector) => {
  // Placeholder: could implement DNS check using dns.promises
  return true;
};

/**
 * Sign email headers with DKIM (for Nodemailer)
 * Example usage with Nodemailer:
 * const transporter = nodemailer.createTransport({
 *   sendmail: true,
 *   dkim: {
 *     domainName: 'example.com',
 *     keySelector: 'default',
 *     privateKey: privateKey
 *   }
 * });
 */
export const signEmailWithDKIM = async (emailOptions, privateKey, selector, domain) => {
  // Nodemailer handles DKIM signing automatically if you pass privateKey, selector, domain
  // This function is a wrapper for that usage
  return {
    ...emailOptions,
    dkim: {
      domainName: domain,
      keySelector: selector,
      privateKey,
    },
  };
};
