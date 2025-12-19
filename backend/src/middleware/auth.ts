import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_TOKEN_MISSING',
          message: 'No authentication token provided',
        },
      });
      return;
    }

    const token = authHeader.substring(7);

    try {
      const payload = verifyAccessToken(token);
      req.user = payload;
      next();
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        res.status(401).json({
          success: false,
          error: {
            code: 'AUTH_TOKEN_EXPIRED',
            message: 'Authentication token has expired',
          },
        });
        return;
      }

      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_TOKEN_INVALID',
          message: 'Invalid authentication token',
        },
      });
      return;
    }
  } catch (error: any) {
    logger.error('Authentication middleware error:', error);
    next(error);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_TOKEN_MISSING',
          message: 'Authentication required',
        },
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN_ACTION',
          message: 'You do not have permission to perform this action',
        },
      });
      return;
    }

    next();
  };
};
