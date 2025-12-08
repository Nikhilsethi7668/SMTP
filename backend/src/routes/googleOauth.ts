import express from "express";
import { google } from "googleapis";
import nodemailer from "nodemailer";
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

/**
 * Helper function to refresh Google OAuth access token
 */
async function refreshAccessToken(emailAccount: any) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: emailAccount.refreshToken,
  });

  const { credentials } = await oauth2Client.refreshAccessToken();
  
  // Update the email account with new tokens
  emailAccount.accessToken = credentials.access_token;
  emailAccount.tokenExpiry = credentials.expiry_date 
    ? new Date(credentials.expiry_date) 
    : null;
  await emailAccount.save();

  return credentials.access_token;
}

/**
 * GET /api/auth/google/send-email
 * Send email using Google OAuth account
 * Query params:
 *   - to: recipient email (required)
 *   - from: sender email address to use (optional, e.g., "info@secretbellymethod.com")
 *   - emailAccountId: ID of the email account to use (optional, uses first Gmail account if not provided)
 *   - subject: email subject (optional, defaults to "Test Email")
 *   - text: email text content (optional, defaults to "This is a test email")
 *   - html: email HTML content (optional)
 */
router.get("/auth/google/send-email", authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { to, emailAccountId, subject, text, html } = req.query;

    // Validate recipient email
    if (!to || typeof to !== "string") {
      return res.status(400).json({
        success: false,
        message: "Recipient email (to) is required",
      });
    }

    // Find email account
    let emailAccount;
    const fromEmail = req.query.from as string | undefined;
    
    if (emailAccountId) {
      emailAccount = await EmailAccount.findOne({
        _id: emailAccountId,
        userId: userId,
        provider: "gmail",
      });
    } else if (fromEmail) {
      // Find by email address
      emailAccount = await EmailAccount.findOne({
        email: fromEmail,
        userId: userId,
        provider: "gmail",
      });
    } else {
      // Use first Gmail account if no ID or email provided
      emailAccount = await EmailAccount.findOne({
        userId: userId,
        provider: "gmail",
      });
    }

    if (!emailAccount) {
      return res.status(404).json({
        success: false,
        message: "Google account not found. Please connect a Google account first.",
      });
    }

    if (!emailAccount.accessToken || !emailAccount.refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Google account is not properly authenticated. Please reconnect the account.",
      });
    }

    // Check if access token is expired and refresh if needed
    let accessToken = emailAccount.accessToken;
    const isExpired = emailAccount.tokenExpiry 
      ? new Date() >= new Date(emailAccount.tokenExpiry)
      : true; // If no expiry date, assume expired for safety

    if (isExpired) {
      console.log(`Access token expired for ${emailAccount.email}, refreshing...`);
      try {
        accessToken = await refreshAccessToken(emailAccount);
        console.log(`Access token refreshed successfully`);
      } catch (error: any) {
        console.error("Error refreshing access token:", error);
        return res.status(401).json({
          success: false,
          message: "Failed to refresh access token. Please reconnect your Google account.",
          error: error.message,
        });
      }
    }

    // Create OAuth2 transporter for Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: emailAccount.email,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: emailAccount.refreshToken,
        accessToken: accessToken,
      },
    });

    // Prepare email content
    const emailSubject = (subject as string) || "Test Email";
    const emailText = (text as string) || "This is a test email sent via Google OAuth";
    const emailHtml = html as string | undefined;

    // Send email
    const mailOptions: any = {
      from: `"${emailAccount.name || emailAccount.email}" <${emailAccount.email}>`,
      to: to as string,
      subject: emailSubject,
      text: emailText,
    };

    if (emailHtml) {
      mailOptions.html = emailHtml;
    }

    const info = await transporter.sendMail(mailOptions);

    return res.json({
      success: true,
      message: "Email sent successfully",
      data: {
        messageId: info.messageId,
        from: emailAccount.email,
        to: to as string,
        subject: emailSubject,
        response: info.response,
      },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send email",
      error: error.message,
    });
  }
});

export default router;
