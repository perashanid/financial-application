import { Router } from 'express';
import { groupController } from '../controllers/groupController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, groupController.create.bind(groupController));
router.get('/', authenticate, groupController.getAll.bind(groupController));
router.get('/:id', authenticate, groupController.getById.bind(groupController));
router.put('/:id', authenticate, groupController.update.bind(groupController));
router.delete('/:id', authenticate, groupController.delete.bind(groupController));

router.post('/:id/members', authenticate, groupController.addMember.bind(groupController));
router.delete('/:id/members/:memberId', authenticate, groupController.removeMember.bind(groupController));

router.post('/:id/bills', authenticate, groupController.addBill.bind(groupController));
router.post('/:id/settle', authenticate, groupController.recordSettlement.bind(groupController));
router.get('/:id/balance', authenticate, groupController.getBalance.bind(groupController));

export default router;
