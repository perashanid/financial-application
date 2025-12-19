import express from 'express';
import { authenticate } from '../middleware/auth';
import { notificationController } from '../controllers/notificationController';

const router = express.Router();

router.use(authenticate);

router.get('/', notificationController.getNotifications);
router.put('/:id/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);
router.delete('/:id', notificationController.deleteNotification);

export default router;
