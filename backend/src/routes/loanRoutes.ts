import { Router } from 'express';
import { loanController } from '../controllers/loanController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, loanController.create.bind(loanController));
router.get('/', authenticate, loanController.getAll.bind(loanController));
router.get('/calculate-interest', authenticate, loanController.calculateInterest.bind(loanController));
router.get('/calculate-emi', authenticate, loanController.calculateEMI.bind(loanController));
router.get('/:id', authenticate, loanController.getById.bind(loanController));
router.put('/:id', authenticate, loanController.update.bind(loanController));
router.delete('/:id', authenticate, loanController.delete.bind(loanController));
router.post('/:id/payment', authenticate, loanController.recordPayment.bind(loanController));

export default router;
