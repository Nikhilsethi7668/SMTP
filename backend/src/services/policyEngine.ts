import net from "net";
import {
  getUserByUsername,
} from "../models/userModel.js";
import {
  getQuotaByUserId,
  isQuotaExceeded,
  isRateLimitExceeded,
  incrementUsage,
} from "../models/quotaModel.js";
import { isBlacklisted } from "../models/blacklistModel.js";
import { getNextAvailableIP, assignIPToUser } from "../models/ipPoolModel.js";
import { addLog } from "../models/logModel.js";

/**
 * Handles a single Postfix policy request
 * Postfix sends key=value pairs separated by \n, ending with \n\n
 */
const handleRequest = async (data: string) => {
  const lines = data.trim().split("\n");
  const request: any = {};
  lines.forEach((line) => {
    const [key, value] = line.split("=");
    if (key && value) request[key] = value;
  });

  const username = request.sasl_username || request.sender;
  const recipient = request.recipient;
  const sender = request.sender;

  // --- Step 1: Lookup user ---
  const user = await getUserByUsername(username);
  if (!user || !user.is_active) {
    return `action=REJECT User not found or inactive\n\n`;
  }

  // --- Step 2: Check blacklists ---
  const senderDomain = sender.split("@")[1];
  const recipientDomain = recipient.split("@")[1];
  if (
    await isBlacklisted("domain", senderDomain) ||
    await isBlacklisted("domain", recipientDomain) ||
    await isBlacklisted("ip", request.client_address)
  ) {
    await addLog({
      user_id: user.id,
      sender_email: sender,
      recipient_email: recipient,
      status: "rejected",
      ip_address: request.client_address,
      reason: "blacklisted domain or IP",
    });
    return `action=REJECT Blacklisted domain or IP\n\n`;
  }

  // --- Step 3: Check quota ---
  const quotaExceeded = await isQuotaExceeded(user.id);
  if (quotaExceeded) {
    await addLog({
      user_id: user.id,
      sender_email: sender,
      recipient_email: recipient,
      status: "rejected",
      ip_address: request.client_address,
      reason: "quota exceeded",
    });
    return `action=REJECT Quota exceeded\n\n`;
  }

  // --- Step 4: Check rate limit ---
  const rateExceeded = await isRateLimitExceeded(user.id);
  if (rateExceeded) {
    return `action=DEFER_IF_PERMIT Rate limit exceeded\n\n`;
  }

  // --- Step 5: Assign IP from pool ---
  let ipRecord = null;
  if (!user.dedicated_ip_id) {
    ipRecord = await getNextAvailableIP();
    if (ipRecord) {
      await assignIPToUser(ipRecord.id, user.id);
    }
  } else {
    // User already has a dedicated IP
    ipRecord = { ip_address: user.dedicated_ip_id };
  }

  // --- Step 6: Update usage and log ---
  await incrementUsage(user.id);
  await addLog({
    user_id: user.id,
    sender_email: sender,
    recipient_email: recipient,
    status: "sent",
    ip_address: ipRecord ? ipRecord.ip_address : request.client_address,
  });

  // --- Step 7: Respond to Postfix ---
  let response = `action=OK\n`;
  if (ipRecord) response += `sender_dependent_authentication=OK\n`; // optional
  return response + `\n`;
};

// --- Start TCP server for Postfix policy delegation ---
export const startPolicyServer = (port = 10030) => {
  const server = net.createServer((socket) => {
    let buffer = "";
    socket.on("data", async (data) => {
      buffer += data.toString();
      if (buffer.endsWith("\n\n")) {
        const reply = await handleRequest(buffer);
        socket.write(reply);
        buffer = "";
      }
    });
  });

  server.listen(port, () => {
    console.log(`Policy service running on port ${port}`);
  });
};
