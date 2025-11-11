import { Request, Response } from "express";
import crypto from "crypto";
import { Types } from "mongoose";
import mongoose from "mongoose";
import EmailAccount from "../models/EmailAccount.js";

const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

// Add a new email for user
export const addUserEmail = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { email, isPrimary = false } = req.body;

    // Check if email already exists
    const existingEmail = await EmailAccount.findOne({ email });
    if (existingEmail) {
      res.status(400).json({
        success: false,
        message: "Email already exists in the system",
      });
      return;
    }

    const verificationToken = generateVerificationToken();
    const verificationTokenExpires = new Date();
    verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24);

    const userEmail = await EmailAccount.create({
      userId: userId,
      email: email,
      isPrimary: isPrimary,
      verificationToken,
      verificationTokenExpires,
    });

    // TODO: Send verification email here
    console.log(`Verification token for ${email}: ${verificationToken}`);

    res.status(201).json({
      success: true,
      data: {
        id: userEmail._id,
        email: userEmail.email,
        isPrimary: userEmail.isPrimary,
        isVerified: userEmail.isVerified,
        verificationToken,
      },
    });
  } catch (error: any) {
    console.error("Error adding user email:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add email",
      error: error.message,
    });
  }
};

// Verify email
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const emailAccount = await EmailAccount.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() },
    });

    if (!emailAccount) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    emailAccount.isVerified = true;
    emailAccount.verificationToken = undefined;
    emailAccount.verificationTokenExpires = undefined;
    await emailAccount.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      data: {
        email: emailAccount.email,
        isVerified: emailAccount.isVerified,
      },
    });
  } catch (error: any) {
    console.error("Error verifying email:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify email",
      error: error.message,
    });
  }
};

// Set primary email
export const setPrimaryEmail = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { emailId } = req.params;
    console.log(emailId, userId)
    
    // First, unset all other primary emails for this user
    await EmailAccount.updateMany(
      { userId: userId, _id: { $ne: emailId } },
      { isPrimary: false }
    );

    const userEmail = await EmailAccount.findOneAndUpdate(
      { _id: emailId, userId: userId },
      { isPrimary: true },
      { new: true }
    );

    if (!userEmail) {
      res.status(404).json({
        success: false,
        message: "Email not found or you do not have permission",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Primary email updated successfully",
      data: {
        id: userEmail._id,
        email: userEmail.email,
        isPrimary: userEmail.isPrimary,
      },
    });
  } catch (error: any) {
    console.error("Error setting primary email:", error);
    res.status(500).json({
      success: false,
      message: "Failed to set primary email",
      error: error.message,
    });
  }
};

// Get user's emails
export const getUserEmails = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    console.log(req.user!.id);
    const emails = await EmailAccount.find({
      userId: new mongoose.Types.ObjectId(userId),
    })
      .select("-verificationToken -verificationTokenExpires -__v")
      .sort({ isPrimary: -1, email: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: emails.length,
      data: emails,
    });
  } catch (error: any) {
    console.error("Error fetching user emails:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch emails",
      error: error.message,
    });
  }
};

// Delete user email
export const deleteUserEmail = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { emailId } = req.params;
    console.log(emailId, userId);
    const email = await EmailAccount.findOneAndDelete({
      _id: emailId,
      userId: userId,
      isPrimary: false,
    });

    if (!email) {
      return res.status(404).json({
        success: false,
        message:
          "Email not found, already deleted, or cannot delete primary email",
      });
    }

    res.status(200).json({
      success: true,
      message: "Email deleted successfully",
      data: { id: email._id, email: email.email },
    });
  } catch (error: any) {
    console.error("Error deleting email:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete email",
      error: error.message,
    });
  }
};

// Resend verification email
export const resendVerification = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { emailId } = req.params;

    const verificationToken = generateVerificationToken();
    const verificationTokenExpires = new Date();
    verificationTokenExpires.setHours(verificationTokenExpires.getHours() + 24);

    const userEmail = await EmailAccount.findOneAndUpdate(
      { _id: emailId, userId: userId, isVerified: false },
      {
        verificationToken,
        verificationTokenExpires,
      },
      { new: true }
    );

    if (!userEmail) {
      return res.status(404).json({
        success: false,
        message: "Email not found or already verified",
      });
    }

    // TODO: Send verification email here
    console.log(
      `New verification token for ${userEmail.email}: ${verificationToken}`
    );

    res.status(200).json({
      success: true,
      message: "Verification email resent successfully",
      data: {
        id: userEmail._id,
        email: userEmail.email,
      },
    });
  } catch (error: any) {
    console.error("Error resending verification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resend verification email",
      error: error.message,
    });
  }
};
