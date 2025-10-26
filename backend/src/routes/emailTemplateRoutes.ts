import express from 'express';
import {
    createTemplate,
    getTemplate,
    updateTemplate,
    deleteTemplate,
    trackLinkClick
} from '../controllers/emailTemplateController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Template CRUD operations
router.post('/templates', createTemplate);
router.get('/templates/:campaignId', getTemplate);
router.put('/templates/:campaignId', updateTemplate);
router.delete('/templates/:campaignId', deleteTemplate);

// Link tracking
router.post('/templates/:campaignId/track-click', trackLinkClick);

export default router;