import { Router } from 'express';
import { authController } from '../controllers/authController';
import { twoFactorController } from '../controllers/twoFactorController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/refresh', authController.refresh.bind(authController));
router.post('/logout', authenticate, authController.logout.bind(authController));

// 2FA routes
router.post('/2fa/enable', authenticate, twoFactorController.enable.bind(twoFactorController));
router.post('/2fa/verify', authenticate, twoFactorController.verifyAndActivate.bind(twoFactorController));
router.post('/2fa/disable', authenticate, twoFactorController.disable.bind(twoFactorController));
router.post('/2fa/verify-login', twoFactorController.verifyLogin.bind(twoFactorController));

export default router;
