import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { userService } from '../services/userService';
import { logger } from '../utils/logger';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

export class UserController {
  async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'AUTH_TOKEN_MISSING', message: 'Authentication required' },
        });
        return;
      }

      const user = await userService.getProfile(userId);
      res.status(200).json({ success: true, data: user });
    } catch (error: any) {
      logger.error('Get profile error:', error);
      next(error);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'AUTH_TOKEN_MISSING', message: 'Authentication required' },
        });
        return;
      }

      const { name, language, currency } = req.body;
      const user = await userService.updateProfile(userId, { name, language, currency });
      res.status(200).json({ success: true, data: user });
    } catch (error: any) {
      logger.error('Update profile error:', error);
      next(error);
    }
  }

  async uploadPhoto(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'AUTH_TOKEN_MISSING', message: 'Authentication required' },
        });
        return;
      }

      if (!req.file) {
        res.status(400).json({
          success: false,
          error: { code: 'MISSING_REQUIRED_FIELD', message: 'Photo file is required' },
        });
        return;
      }

      const result = await userService.uploadProfilePhoto(userId, req.file.buffer);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      logger.error('Upload photo error:', error);
      next(error);
    }
  }

  async updateSettings(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'AUTH_TOKEN_MISSING', message: 'Authentication required' },
        });
        return;
      }

      const { notifications, privacy } = req.body;
      const user = await userService.updateSettings(userId, { notifications, privacy });
      res.status(200).json({ success: true, data: user });
    } catch (error: any) {
      logger.error('Update settings error:', error);
      next(error);
    }
  }

  async deleteAccount(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'AUTH_TOKEN_MISSING', message: 'Authentication required' },
        });
        return;
      }

      await userService.deleteAccount(userId);
      res.status(200).json({ success: true, message: 'Account deleted successfully' });
    } catch (error: any) {
      logger.error('Delete account error:', error);
      next(error);
    }
  }
}

export const userController = new UserController();
export { upload };
