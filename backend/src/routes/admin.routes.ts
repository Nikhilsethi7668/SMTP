import { Router } from 'express';
import { updatePricing, updateCreditCost } from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

// All admin routes require authentication
router.use(authenticate);

// Middleware to check if user is admin
const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  next();
};

router.post('/pricing', requireAdmin, updatePricing);
router.post('/credit-cost', requireAdmin, updateCreditCost);

export default router;
