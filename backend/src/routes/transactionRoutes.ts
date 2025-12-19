import { Router } from 'express';
import { transactionController, upload } from '../controllers/transactionController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, transactionController.create.bind(transactionController));
router.get('/', authenticate, transactionController.getAll.bind(transactionController));
router.get('/balance', authenticate, transactionController.getBalance.bind(transactionController));
router.get('/:id', authenticate, transactionController.getById.bind(transactionController));
router.put('/:id', authenticate, transactionController.update.bind(transactionController));
router.delete('/:id', authenticate, transactionController.delete.bind(transactionController));
router.post('/:id/receipt', authenticate, upload.single('receipt'), transactionController.uploadReceipt.bind(transactionController));

export default router;
