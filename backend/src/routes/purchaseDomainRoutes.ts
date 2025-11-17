import express from 'express';
import {
  searchDomains,
  checkDomain,
  getDomainPricing,
  purchaseDomain,
  getMyPurchasedDomains,
  getPurchasedDomainById,
  getEnomBalance,
  checkPurchasedDomainStatus,
  callEnomCommand,
  setPurchasedDomainDNS,
} from '../controllers/purchaseDomainController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route - search domains (can be made public for browsing)
// This route does NOT require authentication
router.get('/search', searchDomains);

// Protected routes - require authentication
// Apply authenticate middleware individually to each protected route

// Check domain availability
router.post('/check', authenticate, checkDomain);

// Get domain pricing
router.get('/pricing', authenticate, getDomainPricing);

// Purchase domain
router.post('/purchase', authenticate, purchaseDomain);

// Note: Cart operations are now handled by /api/domain-cart routes

// Get user's purchased domains
router.get('/my-domains', authenticate, getMyPurchasedDomains);

// Check registration status for a purchased domain
router.post('/my-domains/:id/check-status', authenticate, checkPurchasedDomainStatus);

// Set DNS records for a purchased domain
router.post('/my-domains/:id/set-dns', authenticate, setPurchasedDomainDNS);

// Get Enom account balance (for testing/admin) - must come before /:id
router.get('/balance', authenticate, getEnomBalance);

// Generic Enom API command endpoint
router.post('/enom-command', authenticate, callEnomCommand);

// Get purchased domain by ID
// router.get('/:id', authenticate, getPurchasedDomainById);

export default router;

