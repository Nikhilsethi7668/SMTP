import express from "express";
import { AuthorizationCode } from "simple-oauth2";
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

export default router;
