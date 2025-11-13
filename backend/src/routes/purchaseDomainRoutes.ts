import express from 'express';
import {
  searchDomains,
  checkDomain,
  getDomainPricing,
  purchaseDomain,
  getMyPurchasedDomains,
  getPurchasedDomainById,
  getEnomBalance,
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

// Get user's purchased domains
router.get('/my-domains', authenticate, getMyPurchasedDomains);

// Get Enom account balance (for testing/admin) - must come before /:id
router.get('/balance', authenticate, getEnomBalance);

// Get purchased domain by ID
// router.get('/:id', authenticate, getPurchasedDomainById);

export default router;

