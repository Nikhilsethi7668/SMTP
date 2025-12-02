import express from "express";
import { google } from "googleapis";
import EmailAccount from "../models/EmailAccount.js";

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

// Initiate Google OAuth login
router.get("/auth/google", (req, res) => {
  const userId = req.query.userId as string;
  
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
    state: userId, // Pass user ID via state parameter
    hd: "*", // Allow Google Workspace accounts from any domain
  });
  res.redirect(url);
});

// OAuth callback handler
router.get("/auth/google/callback", async (req, res) => {
  const { code, state }: any = req.query;
  
  if (!code) {
    return res.status(400).json({
      success: false,
      message: "No authorization code provided",
    });
  }
  
  if (!state) {
    return res.status(400).json({
      success: false,
      message: "No state (user ID) provided",
    });
  }

  try {
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user profile
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    });
    const { data: profile } = await oauth2.userinfo.get();

    // Use the user ID from the state parameter
    const userId = state;

    // Check if account already exists
    const existing = await EmailAccount.findOne({ 
      email: profile.email,
      userId: userId 
    });
    
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

    res.redirect(`${process.env.CLIENT_URL}/dashboard/email-accounts`);
  } catch (error: any) {
    console.error("OAuth callback error:", error);
    
    // Send error message to popup
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>OAuth Error</title>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'oauth-error' }, '${process.env.CLIENT_URL}');
            window.close();
          } else {
            window.location.href = '${process.env.CLIENT_URL}/dashboard/accounts/connect?error=oauth_failed';
          }
        </script>
      </head>
      <body>
        <p>Authentication failed. This window will close automatically...</p>
      </body>
      </html>
    `);
  }
});

export default router;
