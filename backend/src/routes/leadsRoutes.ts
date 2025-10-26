// src/routes/leadsRoutes.ts
import express, { Router } from 'express';
import multer from 'multer';
import { 
    addLead, 
    uploadLeadsCSV, 
    getLeads 
} from '../controllers/leadsController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router: Router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Protected routes (require authentication)
router.use(authenticate);

// Add a single lead
router.post('/', addLead);

// Upload leads via CSV
router.post('/upload', upload.single('file'), uploadLeadsCSV);

// Get all leads with optional filtering
router.get('/', getLeads);

export default router;