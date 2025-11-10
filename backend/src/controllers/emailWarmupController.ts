import { Request, Response } from "express";
import { EmailWarmup } from "../models/emailWarmupModel.js";
import EmailAccount from "../models/EmailAccount.js";
import mongoose from "mongoose";

// Create a new email warmup
export const createEmailWarmup = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { emailAccountId, warmupSettings } = req.body;

    if (!emailAccountId) {
      return res.status(400).json({
        success: false,
        message: "Email account ID is required",
      });
    }

    // Verify the email account belongs to the user
    const emailAccount = await EmailAccount.findOne({
      _id: emailAccountId,
      userId: userId,
    });

    if (!emailAccount) {
      return res.status(404).json({
        success: false,
        message: "Email account not found or you don't have permission",
      });
    }

    // Check if warmup already exists for this account
    const existingWarmup = await EmailWarmup.findOne({
      emailAccountId: emailAccountId,
      userId: userId,
      status: { $in: ["pending", "active"] },
    });

    if (existingWarmup) {
      return res.status(400).json({
        success: false,
        message: "Warmup already exists for this email account",
      });
    }

    // Create warmup with default or provided settings
    const warmup = await EmailWarmup.create({
      userId: userId,
      emailAccountId: emailAccountId,
      email: emailAccount.email,
      status: "pending",
      warmupSettings: {
        dailyEmailLimit: warmupSettings?.dailyEmailLimit || 5,
        replyRate: warmupSettings?.replyRate || 30,
        openRate: warmupSettings?.openRate || 40,
        startDate: warmupSettings?.startDate || new Date(),
        duration: warmupSettings?.duration || 30,
      },
      stats: {
        emailsSent: 0,
        emailsReceived: 0,
        repliesReceived: 0,
        opensReceived: 0,
        lastActivity: new Date(),
      },
    });

    res.status(201).json({
      success: true,
      message: "Email warmup created successfully",
      data: warmup,
    });
  } catch (error: any) {
    console.error("Error creating email warmup:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create email warmup",
      error: error.message,
    });
  }
};

// Get all warmups for the user
export const getUserWarmups = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const warmups = await EmailWarmup.find({ userId })
      .populate("emailAccountId", "email provider isPrimary")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: warmups.length,
      data: warmups,
    });
  } catch (error: any) {
    console.error("Error fetching warmups:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch warmups",
      error: error.message,
    });
  }
};

// Get a single warmup by ID
export const getWarmupById = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const warmup = await EmailWarmup.findOne({
      _id: id,
      userId: userId,
    })
      .populate("emailAccountId", "email provider isPrimary")
      .lean();

    if (!warmup) {
      return res.status(404).json({
        success: false,
        message: "Warmup not found",
      });
    }

    res.status(200).json({
      success: true,
      data: warmup,
    });
  } catch (error: any) {
    console.error("Error fetching warmup:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch warmup",
      error: error.message,
    });
  }
};

// Update warmup status
export const updateWarmupStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["pending", "active", "paused", "completed", "failed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Valid status is required",
      });
    }

    const warmup = await EmailWarmup.findOneAndUpdate(
      { _id: id, userId: userId },
      { status },
      { new: true }
    )
      .populate("emailAccountId", "email provider isPrimary")
      .lean();

    if (!warmup) {
      return res.status(404).json({
        success: false,
        message: "Warmup not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Warmup status updated successfully",
      data: warmup,
    });
  } catch (error: any) {
    console.error("Error updating warmup status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update warmup status",
      error: error.message,
    });
  }
};

// Delete a warmup
export const deleteWarmup = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const warmup = await EmailWarmup.findOneAndDelete({
      _id: id,
      userId: userId,
    });

    if (!warmup) {
      return res.status(404).json({
        success: false,
        message: "Warmup not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Warmup deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting warmup:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete warmup",
      error: error.message,
    });
  }
};

