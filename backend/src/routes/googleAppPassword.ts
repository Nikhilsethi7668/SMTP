import express from "express";
import EmailAccount from "../models/EmailAccount.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// Google App Password connection endpoint
router.post("/auth/google/app-password", authenticate, async (req, res) => {
  try {
    const { firstName, lastName, email, appPassword } = req.body;
    const userId = req.user!.id;

    // Validate required fields
    if (!email || !appPassword) {
      return res.status(400).json({
        success: false,
        message: "Email and app password are required",
      });
    }

    // Validate app password length (16 characters without spaces)
    if (appPassword.length !== 16) {
      return res.status(400).json({
        success: false,
        message: "App password must be exactly 16 characters",
      });
    }

    // Check if account already exists
    const existing = await EmailAccount.findOne({ email, userId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "This email account is already connected",
      });
    }

    // Create new email account with app password
    const name = [firstName, lastName].filter(Boolean).join(" ") || email.split("@")[0];

    await EmailAccount.create({
      userId: userId,
      provider: "gmail",
      email: email,
      name: name,
      smtp: {
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        user: email,
        password: appPassword,
      },
      imap: {
        host: "imap.gmail.com",
        port: 993,
        secure: true,
        user: email,
        password: appPassword,
      },
    });

    res.json({
      success: true,
      message: "Google account connected successfully",
    });
  } catch (error: any) {
    console.error("Error connecting Google app password:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to connect account",
    });
  }
});

export default router;
