import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

import { signEmailWithDKIM } from "../backend/src/services/dkimService.js";

// -----------------------------
// Environment variables
// -----------------------------
const POSTFIX_HOST = process.env.POSTFIX_HOST || "postfix"; // docker service name
const POSTFIX_PORT = process.env.POSTFIX_PORT || 25;
const POSTFIX_USER = process.env.POSTFIX_USER || ""; // optional SASL auth
const POSTFIX_PASS = process.env.POSTFIX_PASS || ""; // optional SASL auth

// -----------------------------
// Create Nodemailer transporter
// -----------------------------
const transporter = nodemailer.createTransport({
  host: POSTFIX_HOST,
  port: POSTFIX_PORT,
  secure: false, // TLS enforced by Postfix, optional STARTTLS
  auth: POSTFIX_USER ? { user: POSTFIX_USER, pass: POSTFIX_PASS } : undefined,
  tls: {
    rejectUnauthorized: false, // allow self-signed certs in dev
  },
});

// -----------------------------
// Send email function
// -----------------------------
export const sendEmail = async ({ from, to, subject, text, html, dkim }) => {
  try {
    let mailOptions = { from, to, subject, text, html };

    // Apply DKIM signing if keys provided
    if (dkim) {
      mailOptions = await signEmailWithDKIM(mailOptions, dkim.privateKey, dkim.selector, dkim.domain);
    }

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("Error sending email:", err);
    throw err;
  }
};

// -----------------------------
// Example usage
// -----------------------------
if (require.main === module) {
  (async () => {
    const emailOptions = {
      from: "no-reply@example.com",
      to: "recipient@example.com",
      subject: "Test SMTP Relay Email",
      text: "Hello from your Node.js SMTP relay!",
      html: "<p>Hello from your Node.js <strong>SMTP relay</strong>!</p>",
      dkim: {
        privateKey: process.env.DKIM_PRIVATE_KEY, // paste key in .env
        selector: process.env.DKIM_SELECTOR || "default",
        domain: process.env.DKIM_DOMAIN || "example.com",
      },
    };

    await sendEmail(emailOptions);
    process.exit(0);
  })();
}
