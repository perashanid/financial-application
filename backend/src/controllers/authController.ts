import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { logger } from '../utils/logger';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, phone, password, role } = req.body;

      // Validation
      if (!name || !email || !password) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_REQUIRED_FIELD',
            message: 'Name, email, and password are required',
          },
        });
        return;
      }

      const result = await authService.register({ name, email, phone, password, role });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('Registration error:', error);
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { emailOrPhone, password } = req.body;

      // Validation
      if (!emailOrPhone || !password) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_REQUIRED_FIELD',
            message: 'Email/phone and password are required',
          },
        });
        return;
      }

      const result = await authService.login({ emailOrPhone, password });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('Login error:', error);
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_REQUIRED_FIELD',
            message: 'Refresh token is required',
          },
        });
        return;
      }

      const result = await authService.refreshAccessToken(refreshToken);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('Token refresh error:', error);
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      await authService.logout(userId);

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error: any) {
      logger.error('Logout error:', error);
      next(error);
    }
  }
}

export const authController = new AuthController();
