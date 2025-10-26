import { Router } from 'express';
import { createCheckoutSession, handleSuccessfulPayment } from '../controllers/payment.controller.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/create-checkout-session', authenticate, createCheckoutSession);
router.get('/success', authenticate, handleSuccessfulPayment);

export default router;
