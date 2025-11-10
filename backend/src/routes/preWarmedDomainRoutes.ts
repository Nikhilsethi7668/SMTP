import express from "express";
import {
  getAvailableDomains,
  reserveDomain,
  getDomainEmails,
  purchaseDomain,
  getUserDomains,
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

export default router;

