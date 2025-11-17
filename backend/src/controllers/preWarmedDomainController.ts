import { Request, Response } from "express";
import { PreWarmedDomain } from "../models/unifiedDomainModel.js";
import mongoose from "mongoose";

// Get all available pre-warmed domains
export const getAvailableDomains = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const query: any = { status: "available" };

    if (search) {
      query.domain = { $regex: search, $options: "i" };
    }

    const domains = await PreWarmedDomain.find(query)
      .select("domain domainPrice emailPrice emails")
      .lean();

    res.status(200).json({
      success: true,
      count: domains.length,
      data: domains,
    });
  } catch (error: any) {
    console.error("Error fetching available domains:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch domains",
      error: error.message,
    });
  }
};

// Reserve a domain (temporary reservation)
export const reserveDomain = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { domain } = req.body;

    if (!domain) {
      return res.status(400).json({
        success: false,
        message: "Domain is required",
      });
    }

    // Check if domain is available
    const domainDoc = await PreWarmedDomain.findOne({
      domain,
      status: "available",
    });

    if (!domainDoc) {
      return res.status(404).json({
        success: false,
        message: "Domain not available",
      });
    }

    // Reserve for 10 minutes
    const reservedUntil = new Date();
    reservedUntil.setMinutes(reservedUntil.getMinutes() + 10);

    domainDoc.status = "reserved";
    domainDoc.reservedUntil = reservedUntil;
    domainDoc.reservedBy = new mongoose.Types.ObjectId(userId);
    await domainDoc.save();

    res.status(200).json({
      success: true,
      message: "Domain reserved successfully",
      data: {
        domain: domainDoc.domain,
        reservedUntil: domainDoc.reservedUntil,
      },
    });
  } catch (error: any) {
    console.error("Error reserving domain:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reserve domain",
      error: error.message,
    });
  }
};

// Get emails for a specific domain
export const getDomainEmails = async (req: Request, res: Response) => {
  try {
    const { domain } = req.params;

    const domainDoc = await PreWarmedDomain.findOne({ domain }).lean();

    if (!domainDoc) {
      return res.status(404).json({
        success: false,
        message: "Domain not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        domain: domainDoc.domain,
        emails: domainDoc.emails,
        domainPrice: domainDoc.domainPrice,
        emailPrice: domainDoc.emailPrice,
        status: domainDoc.status,
      },
    });
  } catch (error: any) {
    console.error("Error fetching domain emails:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch domain emails",
      error: error.message,
    });
  }
};

// Purchase domain and emails
export const purchaseDomain = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { domain, selectedEmails, forwarding } = req.body;

    if (!domain || !selectedEmails || !Array.isArray(selectedEmails)) {
      return res.status(400).json({
        success: false,
        message: "Domain and selected emails are required",
      });
    }

    const domainDoc = await PreWarmedDomain.findOne({
      domain,
      $or: [
        { status: "available" },
        { status: "reserved", reservedBy: userId },
      ],
    });

    if (!domainDoc) {
      return res.status(404).json({
        success: false,
        message: "Domain not available or reservation expired",
      });
    }

    // Verify selected emails exist in domain
    const validEmails = domainDoc.emails.filter((email) =>
      selectedEmails.includes(email.email)
    );

    if (validEmails.length !== selectedEmails.length) {
      return res.status(400).json({
        success: false,
        message: "Some selected emails are invalid",
      });
    }

    // Update domain ownership
    // Don't set userId if user is admin
    if (userRole !== 'admin') {
      domainDoc.userId = new mongoose.Types.ObjectId(userId);
    }
    domainDoc.forwarding = forwarding || undefined;
    domainDoc.status = "purchased";
    domainDoc.reservedUntil = undefined;
    domainDoc.reservedBy = undefined;
    await domainDoc.save();

    res.status(200).json({
      success: true,
      message: "Domain purchased successfully",
      data: {
        domain: domainDoc.domain,
        emails: validEmails,
        forwarding: domainDoc.forwarding,
      },
    });
  } catch (error: any) {
    console.error("Error purchasing domain:", error);
    res.status(500).json({
      success: false,
      message: "Failed to purchase domain",
      error: error.message,
    });
  }
};

// Get user's purchased domains
export const getUserDomains = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    const domains = await PreWarmedDomain.find({
      userId: userId,
      status: "purchased",
    })
      .select("domain emails forwarding createdAt")
      .lean();

    res.status(200).json({
      success: true,
      count: domains.length,
      data: domains,
    });
  } catch (error: any) {
    console.error("Error fetching user domains:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user domains",
      error: error.message,
    });
  }
};

// Get all purchased domains
export const getAllPurchasedDomains = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const query: any = { status: "purchased" };

    if (search) {
      query.domain = { $regex: search, $options: "i" };
    }

    const domains = await PreWarmedDomain.find(query)
      .select("domain emails forwarding userId createdAt updatedAt warmingup")
      .populate("userId", "email full_name username")
      .lean();

    res.status(200).json({
      success: true,
      count: domains.length,
      data: domains,
    });
  } catch (error: any) {
    console.error("Error fetching all purchased domains:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch purchased domains",
      error: error.message,
    });
  }
};

// Get all domains (admin) - regardless of status
export const getAllDomains = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const query: any = {};

    if (search) {
      query.domain = { $regex: search, $options: "i" };
    }

    const domains = await PreWarmedDomain.find(query)
      .select("domain emails forwarding userId createdAt updatedAt status warmingup")
      .populate("userId", "email full_name username")
      .lean();

    res.status(200).json({
      success: true,
      count: domains.length,
      data: domains,
    });
  } catch (error: any) {
    console.error("Error fetching all domains:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch domains",
      error: error.message,
    });
  }
};

// Get domain by ID with full details
export const getDomainById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const domainDoc = await PreWarmedDomain.findById(id)
      .populate("userId", "email full_name username")
      .lean();

    if (!domainDoc) {
      return res.status(404).json({
        success: false,
        message: "Domain not found",
      });
    }

    res.status(200).json({
      success: true,
      data: domainDoc,
    });
  } catch (error: any) {
    console.error("Error fetching domain:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch domain",
      error: error.message,
    });
  }
};

// Enable/disable warmup for a domain
export const toggleDomainWarmup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { warmingup } = req.body;

    if (typeof warmingup !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "warmingup must be a boolean value",
      });
    }

    const domainDoc = await PreWarmedDomain.findById(id);

    if (!domainDoc) {
      return res.status(404).json({
        success: false,
        message: "Domain not found",
      });
    }

    domainDoc.warmingup = warmingup;
    await domainDoc.save();

    // Fetch the updated domain with populated userId
    const updatedDomain = await PreWarmedDomain.findById(id)
      .populate("userId", "email full_name username")
      .lean();

    res.status(200).json({
      success: true,
      message: `Warmup ${warmingup ? "enabled" : "disabled"} successfully`,
      data: updatedDomain,
    });
  } catch (error: any) {
    console.error("Error toggling domain warmup:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle warmup",
      error: error.message,
    });
  }
};

