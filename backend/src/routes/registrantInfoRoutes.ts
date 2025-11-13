import express from 'express';
import {
  getRegistrantInfo,
  getAllRegistrantInfo,
  saveRegistrantInfo,
  updateRegistrantInfo,
  deleteRegistrantInfo,
  setDefaultRegistrantInfo,
} from '../controllers/registrantInfoController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get default or most recent registrant info
router.get('/', getRegistrantInfo);

// Get all registrant info for user
router.get('/all', getAllRegistrantInfo);

// Save new registrant info
router.post('/', saveRegistrantInfo);

// Set default registrant info
router.patch('/:id/set-default', setDefaultRegistrantInfo);

// Update registrant info
router.put('/:id', updateRegistrantInfo);

// Delete registrant info
router.delete('/:id', deleteRegistrantInfo);

export default router;

