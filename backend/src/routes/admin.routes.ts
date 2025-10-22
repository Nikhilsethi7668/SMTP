import { Router } from 'express';
import { updatePricing } from '../controllers/admin.controller.js';

const router = Router();

router.post('/pricing', updatePricing);

export default router;
