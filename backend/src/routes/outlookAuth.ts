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
  "https://outlook.office.com/IMAP.AccessAsUser.All",
  "https://outlook.office.com/SMTP.Send",
  "https://outlook.office.com/User.Read",
];

router.get("/auth/outlook", authenticate, (req, res) => {
  const url = client.authorizeURL({
    redirect_uri: process.env.OUTLOOK_REDIRECT_URI,
    scope: SCOPES.join(" "),
    state: req.user!.id, // Pass user ID via state parameter
  });
  res.redirect(url);
});

router.get("/auth/outlook/callback", async (req, res) => {
  const { code, state }: any = req.query;
  
  if (!state) {
    return res.status(400).json({
      success: false,
      message: "No state (user ID) provided",
    });
  }

  const tokenParams = {
    code,
    redirect_uri: process.env.OUTLOOK_REDIRECT_URI,
    scope: SCOPES.join(" "),
  };
  const accessToken = await client.getToken(tokenParams as any);
  const token = accessToken.token;

  // Use the user ID from the state parameter
  const userId = state;

  await EmailAccount.create({
    userId: userId,
    provider: "outlook",
    email: "unknown@outlook.com", // you can fetch via Microsoft Graph API if needed
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

  res.send("✅ Outlook connected successfully!");
});

export default router;
