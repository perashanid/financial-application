import { Request, Response, NextFunction } from 'express';
import { twoFactorService } from '../services/twoFactorService';
import { logger } from '../utils/logger';

export class TwoFactorController {
  async enable(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'AUTH_TOKEN_MISSING',
            message: 'Authentication required',
          },
        });
        return;
      }

      const result = await twoFactorService.enable(userId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('2FA enable error:', error);
      next(error);
    }
  }

  async verifyAndActivate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { token } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'AUTH_TOKEN_MISSING',
            message: 'Authentication required',
          },
        });
        return;
      }

      if (!token) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_REQUIRED_FIELD',
            message: 'Verification token is required',
          },
        });
        return;
      }

      const result = await twoFactorService.verifyAndActivate(userId, token);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('2FA verify error:', error);
      next(error);
    }
  }

  async disable(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { token } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'AUTH_TOKEN_MISSING',
            message: 'Authentication required',
          },
        });
        return;
      }

      if (!token) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_REQUIRED_FIELD',
            message: 'Verification token is required',
          },
        });
        return;
      }

      await twoFactorService.disable(userId, token);

      res.status(200).json({
        success: true,
        message: '2FA disabled successfully',
      });
    } catch (error: any) {
      logger.error('2FA disable error:', error);
      next(error);
    }
  }

  async verifyLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { emailOrPhone, password, token } = req.body;

      if (!emailOrPhone || !password || !token) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_REQUIRED_FIELD',
            message: 'Email/phone, password, and 2FA token are required',
          },
        });
        return;
      }

      const result = await twoFactorService.verifyLogin(emailOrPhone, password, token);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('2FA login verify error:', error);
      next(error);
    }
  }
}

export const twoFactorController = new TwoFactorController();
