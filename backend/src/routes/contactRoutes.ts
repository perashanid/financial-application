import { Router } from 'express';
import { contactController } from '../controllers/contactController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', contactController.createContact);
router.get('/', contactController.getContacts);
router.get('/frequent', contactController.getFrequentContacts);
router.get('/:id', contactController.getContactById);
router.put('/:id', contactController.updateContact);
router.delete('/:id', contactController.deleteContact);
router.get('/:id/transactions', contactController.getContactTransactions);

export default router;
