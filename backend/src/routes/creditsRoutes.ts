import { Router } from 'express';
import { getCredits } from '../controllers/creditsController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getCredits);

export default router;

