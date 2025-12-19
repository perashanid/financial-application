import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/requireAdmin';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

router.get('/users', adminController.getAllUsers.bind(adminController));
router.get('/users/:id', adminController.getUserDetails.bind(adminController));
router.put('/users/:id/status', adminController.updateUserStatus.bind(adminController));
router.put('/users/:id/role', adminController.updateUserRole.bind(adminController));
router.get('/statistics', adminController.getPlatformStatistics.bind(adminController));
router.get('/moderation/queue', adminController.getModerationQueue.bind(adminController));
router.post('/moderation/campaigns/:id/approve', adminController.approveCampaign.bind(adminController));
router.post('/moderation/campaigns/:id/reject', adminController.rejectCampaign.bind(adminController));
router.get('/activity-logs', adminController.getActivityLogs.bind(adminController));

export default router;
