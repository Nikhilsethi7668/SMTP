import express from "express";
import {
  getAvailableDomains,
  reserveDomain,
  getDomainEmails,
  purchaseDomain,
  getUserDomains,
  getAllPurchasedDomains,
  getAllDomains,
  getDomainById,
  toggleDomainWarmup,
} from "../controllers/preWarmedDomainController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route - get available domains
router.get("/pre-warmed-domains", getAvailableDomains);

// Protected routes
router.use(authenticate);

// Reserve a domain
router.post("/pre-warmed-domains/reserve", reserveDomain);

// Get emails for a domain
router.get("/pre-warmed-domains/:domain/emails", getDomainEmails);

// Purchase domain
router.post("/pre-warmed-domains/purchase", purchaseDomain);

// Get user's purchased domains
router.get("/pre-warmed-domains/user", getUserDomains);

// Get all purchased domains
router.get("/pre-warmed-domains/purchased", getAllPurchasedDomains);

// Admin routes - get all domains
router.get("/pre-warmed-domains/all", getAllDomains);

// Get domain by ID
router.get("/pre-warmed-domains/id/:id", getDomainById);

// Toggle warmup for a domain
router.patch("/pre-warmed-domains/:id/warmup", toggleDomainWarmup);

export default router;

