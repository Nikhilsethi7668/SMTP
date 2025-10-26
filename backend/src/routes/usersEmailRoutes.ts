import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { addUserEmail, deleteUserEmail, getUserEmails, resendVerification, setPrimaryEmail, verifyEmail, } from '../controllers/usersEmailController.js';

const router = Router();

// Protect all routes with authentication
router.use(authenticate);

// Get all user's emails
router.get('/', getUserEmails);

// Add new email
router.post('/', addUserEmail);

// Verify email (public route, no authentication required)
router.get('/verify/:token', verifyEmail);

// Set primary email
router.patch('/:emailId/set-primary', setPrimaryEmail);

// Delete email
router.delete('/:emailId', deleteUserEmail);

// Resend verification email
router.post('/:emailId/resend-verification', resendVerification);

export default router;
