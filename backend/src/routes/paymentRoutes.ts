import { Router } from 'express';
import { paymentController } from '../controllers/paymentController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, paymentController.initiatePayment.bind(paymentController));
router.get('/history', authenticate, paymentController.getPaymentHistory.bind(paymentController));
router.get('/:id', authenticate, paymentController.getPayment.bind(paymentController));
router.post('/:id/verify', paymentController.verifyPayment.bind(paymentController));

export default router;
