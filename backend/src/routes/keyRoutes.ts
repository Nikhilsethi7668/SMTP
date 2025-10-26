import { Router } from 'express';
import {
  createApiKey,
  getUserApiKeys,
  deleteApiKey,
} from '../controllers/keyController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.post('/', createApiKey);

router.get('/', getUserApiKeys);

router.delete('/:id', deleteApiKey);

export default router;
