import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { User } from '../models/User';
import { logger } from '../utils/logger';

/**
 * Middleware to verify 2FA is completed for users who have it enabled
 * This should be used after the authenticate middleware
 */
export const require2FA = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;

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

    // Check if user has 2FA enabled
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      });
      return;
    }

    // If 2FA is enabled but not verified in this session, require verification
    if (user.twoFactorEnabled && !(req as any).session?.twoFactorVerified) {
      res.status(403).json({
        success: false,
        error: {
          code: 'AUTH_2FA_REQUIRED',
          message: 'Two-factor authentication verification required',
        },
      });
      return;
    }

    next();
  } catch (error: any) {
    logger.error('2FA middleware error:', error);
    next(error);
  }
};
