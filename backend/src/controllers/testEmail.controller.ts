import { Request, Response } from "express";
import { CampaignSequenceVariant } from "../models/CampaignSequenceVariantModel.js";
import { sendEmail } from "../utils/sendEmail.js";

export const sendTestEmail = async (req: Request, res: Response) => {
  try {
    const { variant_id } = req.params;
    const { to, from } = req.body;

    // Validate inputs
    if (!to || !from) {
      return res.status(400).json({
        success: false,
        message: "Both 'to' and 'from' email addresses are required",
      });
    }

    // Fetch variant content
    const variant = await CampaignSequenceVariant.findById(variant_id);
    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Variant not found",
      });
    }

    const subject = variant.subject || "No Subject";
    const body = variant.body || "No Content";

    // Send Email (ONLY TEXT)
    const mailResult = await sendEmail({
      from,
      to,
      subject,
      text: body,   // ← ONLY text, no HTML
    });

    return res.json({
      success: true,
      message: "Test email sent successfully",
      data: mailResult,
    });
  } catch (error: any) {
    console.error("Send Test Email Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send test email",
      error: error.message,
    });
  }
};
