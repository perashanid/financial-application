import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { User } from '../models/User';

export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
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

    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Admin access required',
        },
      });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};
