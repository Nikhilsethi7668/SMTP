import { Router } from 'express';
import * as domainController from '../controllers/domainController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.post('/', domainController.createDomain);
router.get('/', domainController.getDomains);
router.get('/:id', domainController.getDomainById);
// router.patch('/:id', domainController.updateDomain);
router.delete('/:id', domainController.deleteDomain);
router.post('/:id/verify', domainController.verifyDomain);

export default router;
