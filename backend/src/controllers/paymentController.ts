import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { paymentService } from '../services/paymentService';
import { logger } from '../utils/logger';

export class PaymentController {
  async initiatePayment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: { code: 'AUTH_TOKEN_MISSING' } });
        return;
      }

      const payment = await paymentService.initiatePayment(userId, req.body);
      res.status(201).json({ success: true, data: payment });
    } catch (error: any) {
      logger.error('Initiate payment error:', error);
      next(error);
    }
  }

  async getPayment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: { code: 'AUTH_TOKEN_MISSING' } });
        return;
      }

      const payment = await paymentService.getPaymentById(req.params.id, userId);
      res.status(200).json({ success: true, data: payment });
    } catch (error: any) {
      logger.error('Get payment error:', error);
      next(error);
    }
  }

  async getPaymentHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: { code: 'AUTH_TOKEN_MISSING' } });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await paymentService.getPaymentHistory(userId, page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      logger.error('Get payment history error:', error);
      next(error);
    }
  }

  async verifyPayment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const payment = await paymentService.verifyPayment(req.params.id, req.body);
      res.status(200).json({ success: true, data: payment });
    } catch (error: any) {
      logger.error('Verify payment error:', error);
      next(error);
    }
  }
}

export const paymentController = new PaymentController();
