import { google } from "googleapis";
import { getGoogleClient } from "./serviceAccountAuth.js";

/**
 * Sends an email using service account impersonation
 * @param fromEmail - The workspace email to send from (will be impersonated)
 * @param rawMessage - Base64-encoded RFC 2822 formatted message
 */
export const sendEmail = async (fromEmail: string, rawMessage: string) => {
  const auth = getGoogleClient(fromEmail);
  await auth.authorize();

  const gmail = google.gmail({ version: "v1", auth });

  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw: rawMessage },
  });
};
