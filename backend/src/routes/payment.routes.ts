import { Router } from 'express';
import { createCheckoutSession, handleSuccessfulPayment } from '../controllers/payment.controller.js';

const router = Router();

router.post('/create-checkout-session', createCheckoutSession);
router.get('/success', handleSuccessfulPayment);

export default router;
