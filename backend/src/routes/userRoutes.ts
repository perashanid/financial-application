import { Router } from 'express';
import { userController, upload } from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/profile', authenticate, userController.getProfile.bind(userController));
router.put('/profile', authenticate, userController.updateProfile.bind(userController));
router.post('/profile/photo', authenticate, upload.single('photo'), userController.uploadPhoto.bind(userController));
router.put('/settings', authenticate, userController.updateSettings.bind(userController));
router.delete('/account', authenticate, userController.deleteAccount.bind(userController));

export default router;
