import express from "express";
import { google } from "googleapis";
import EmailAccount from "../models/EmailAccount.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const SCOPES = [
  "https://mail.google.com/",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

// Protect the initial auth route to get user context
router.get("/auth/google", authenticate, (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
    state: req.user!.id, // Pass user ID via state parameter
  });
  res.redirect(url);
});

router.get("/auth/google/callback", async (req, res) => {
  const { code, state }: any = req.query;
  if (!code) {
    return res.status(400).json({
      success: false,
      message: "No code provided",
    });
  }
  
  if (!state) {
    return res.status(400).json({
      success: false,
      message: "No state (user ID) provided",
    });
  }

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  const oauth2 = google.oauth2({
    auth: oauth2Client,
    version: "v2",
  });
  const { data: profile } = await oauth2.userinfo.get();

  // Use the user ID from the state parameter
  const userId = state;

  const existing = await EmailAccount.findOne({ email: profile.email });
  if (!existing) {
    await EmailAccount.create({
      userId: userId,
      provider: "gmail",
      email: profile.email,
      name: profile.name,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      smtp: {
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        user: profile.email,
      },
      imap: {
        host: "imap.gmail.com",
        port: 993,
        secure: true,
        user: profile.email,
      },
    });
  }

  res.send("✅ Gmail connected successfully!");
});

export default router;
