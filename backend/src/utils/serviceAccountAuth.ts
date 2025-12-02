import { google } from "googleapis";

/**
 * Creates a Google JWT client for service account impersonation
 * @param userEmail - The workspace user email to impersonate
 * @returns JWT client configured for impersonation
 */
export const getGoogleClient = (userEmail: string) => {
  const jwtClient = new google.auth.JWT({
    email: process.env.SA_CLIENT_EMAIL,
    key: process.env.SA_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: [
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/gmail.modify",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    subject: userEmail,
  });

  return jwtClient;
};
