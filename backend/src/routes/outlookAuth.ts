import express from "express";
import { AuthorizationCode } from "simple-oauth2";
import nodemailer from "nodemailer";
import EmailAccount from "../models/EmailAccount.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

const client = new AuthorizationCode({
  client: {
    id: process.env.OUTLOOK_CLIENT_ID!,
    secret: process.env.OUTLOOK_CLIENT_SECRET!,
  },
  auth: {
    tokenHost: "https://login.microsoftonline.com",
    authorizePath: "/common/oauth2/v2.0/authorize",
    tokenPath: "/common/oauth2/v2.0/token",
  },
});

const SCOPES = [
  "offline_access",
  "openid",
  "profile",
  "email",
  "https://graph.microsoft.com/User.Read",
  "https://graph.microsoft.com/Mail.Send",
  "https://graph.microsoft.com/Mail.ReadWrite",
  "https://graph.microsoft.com/SMTP.Send",
  "https://graph.microsoft.com/IMAP.AccessAsUser.All",
];

router.get("/auth/outlook", (req, res) => {
  const userId = req.query.userId as string;
  
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  const url = client.authorizeURL({
    redirect_uri: process.env.OUTLOOK_REDIRECT_URI,
    scope: SCOPES.join(" "),
    state: userId,
  });
  res.redirect(url);
});

router.get("/auth/outlook/callback", async (req, res) => {
  const { code, state }: any = req.query;

  if (!state) return res.status(400).send("Missing state");

  try {
    const tokenParams = {
      code,
      redirect_uri: process.env.OUTLOOK_REDIRECT_URI,
      scope: SCOPES.join(" "),
    };

    const accessToken = await client.getToken(tokenParams as any);
    const token = accessToken.token;

    // Fetch REAL email using Microsoft Graph
    const profileRes = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${token.access_token}` }
    });
    const profile = await profileRes.json();

    const email = profile.mail || profile.userPrincipalName;

    await EmailAccount.create({
      userId: state,
      provider: "outlook",
      email: email,
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      tokenExpiry: new Date(token.expires_at as string),
      smtp: {
        host: "smtp.office365.com",
        port: 587,
        secure: false,
      },
      imap: {
        host: "outlook.office365.com",
        port: 993,
        secure: true,
      },
    });

    res.redirect(`${process.env.CLIENT_URL}/oauth-success.html`);
  } catch (error: any) {
    console.error("Outlook OAuth callback error:", error);
    
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
 * Helper function to refresh Microsoft OAuth access token
 */
async function refreshMicrosoftToken(emailAccount: any) {
  const client = new AuthorizationCode({
    client: {
      id: process.env.OUTLOOK_CLIENT_ID!,
      secret: process.env.OUTLOOK_CLIENT_SECRET!,
    },
    auth: {
      tokenHost: "https://login.microsoftonline.com",
      authorizePath: "/common/oauth2/v2.0/authorize",
      tokenPath: "/common/oauth2/v2.0/token",
    },
  });

  const tokenParams = {
    grant_type: "refresh_token",
    refresh_token: emailAccount.refreshToken,
    client_id: process.env.OUTLOOK_CLIENT_ID!,
    client_secret: process.env.OUTLOOK_CLIENT_SECRET!,
    scope: SCOPES.join(" "),
  };

  const response = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(tokenParams as any),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: "Unknown error" } }));
    throw new Error(`Failed to refresh token: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();

  // Update the email account with new tokens
  emailAccount.accessToken = data.access_token;
  emailAccount.refreshToken = data.refresh_token || emailAccount.refreshToken; // Keep old refresh token if new one not provided
  emailAccount.tokenExpiry = data.expires_in 
    ? new Date(Date.now() + data.expires_in * 1000)
    : null;
  await emailAccount.save();

  return data.access_token;
}

/**
 * GET /api/auth/outlook/send-email
 * Send email using Microsoft OAuth account
 * Query params:
 *   - to: recipient email (required)
 *   - from: sender email address to use (optional, e.g., "info@example.com")
 *   - emailAccountId: ID of the email account to use (optional, uses first Outlook account if not provided)
 *   - subject: email subject (optional, defaults to "Test Email")
 *   - text: email text content (optional, defaults to "This is a test email")
 *   - html: email HTML content (optional)
 */
router.get("/auth/outlook/send-email", authenticate, async (req, res) => {
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
        provider: "outlook",
      });
    } else if (fromEmail) {
      // Find by email address
      emailAccount = await EmailAccount.findOne({
        email: fromEmail,
        userId: userId,
        provider: "outlook",
      });
    } else {
      // Use first Outlook account if no ID or email provided
      emailAccount = await EmailAccount.findOne({
        userId: userId,
        provider: "outlook",
      });
    }

    if (!emailAccount) {
      return res.status(404).json({
        success: false,
        message: "Microsoft account not found. Please connect a Microsoft account first.",
      });
    }

    if (!emailAccount.accessToken || !emailAccount.refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Microsoft account is not properly authenticated. Please reconnect the account.",
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
        accessToken = await refreshMicrosoftToken(emailAccount);
        console.log(`Access token refreshed successfully`);
      } catch (error: any) {
        console.error("Error refreshing access token:", error);
        return res.status(401).json({
          success: false,
          message: "Failed to refresh access token. Please reconnect your Microsoft account.",
          error: error.message,
        });
      }
    }

    // Create OAuth2 transporter for Microsoft/Office365
    const transporter = nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      secure: false, // STARTTLS
      auth: {
        type: "OAuth2",
        user: emailAccount.email,
        clientId: process.env.OUTLOOK_CLIENT_ID,
        clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
        refreshToken: emailAccount.refreshToken,
        accessToken: accessToken,
      },
    });

    // Prepare email content
    const emailSubject = (subject as string) || "Test Email";
    const emailText = (text as string) || "This is a test email sent via Microsoft OAuth";
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
