import express from 'express';
import {
    createIncomingEmail,
    getIncomingEmails,
    getIncomingEmailById,
    updateIncomingEmailStatus,
    getIncomingEmailsByCampaign
} from '../controllers/incomingEmailController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', createIncomingEmail);
router.get('/', authenticate, getIncomingEmails);
router.get('/:id', authenticate, getIncomingEmailById);
router.get('/campaign/:campaignId', authenticate, getIncomingEmailsByCampaign);

export default router;