import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { analyticsService } from '../services/analyticsService';
import { logger } from '../utils/logger';

export class AnalyticsController {
  async getDashboard(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'AUTH_TOKEN_MISSING', message: 'Authentication required' },
        });
        return;
      }

      const summary = await analyticsService.getDashboardSummary(userId);
      res.status(200).json({ success: true, data: summary });
    } catch (error: any) {
      logger.error('Get dashboard error:', error);
      next(error);
    }
  }

  async getCategoryBreakdown(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'AUTH_TOKEN_MISSING', message: 'Authentication required' },
        });
        return;
      }

      const { startDate, endDate } = req.query;
      const breakdown = await analyticsService.getCategoryBreakdown(
        userId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.status(200).json({ success: true, data: breakdown });
    } catch (error: any) {
      logger.error('Get category breakdown error:', error);
      next(error);
    }
  }

  async getMonthlyTrends(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'AUTH_TOKEN_MISSING', message: 'Authentication required' },
        });
        return;
      }

      const { months } = req.query;
      const trends = await analyticsService.getMonthlyTrends(
        userId,
        months ? parseInt(months as string) : 12
      );

      res.status(200).json({ success: true, data: trends });
    } catch (error: any) {
      logger.error('Get monthly trends error:', error);
      next(error);
    }
  }

  async getSavingsRate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'AUTH_TOKEN_MISSING', message: 'Authentication required' },
        });
        return;
      }

      const ratio = await analyticsService.getSavingsVsExpensesRatio(userId);
      res.status(200).json({ success: true, data: ratio });
    } catch (error: any) {
      logger.error('Get savings rate error:', error);
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();


import { predictionService } from '../services/predictionService';

export class PredictionController {
  async predictExpenses(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'AUTH_TOKEN_MISSING', message: 'Authentication required' },
        });
        return;
      }

      const { months } = req.query;
      const prediction = await predictionService.predictExpenses(
        userId,
        months ? parseInt(months as string) : 3
      );

      res.status(200).json({ success: true, data: prediction });
    } catch (error: any) {
      logger.error('Predict expenses error:', error);
      next(error);
    }
  }

  async estimateLoanPayoff(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { loanId } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'AUTH_TOKEN_MISSING', message: 'Authentication required' },
        });
        return;
      }

      const estimate = await predictionService.estimateLoanPayoff(loanId, userId);
      res.status(200).json({ success: true, data: estimate });
    } catch (error: any) {
      logger.error('Estimate loan payoff error:', error);
      next(error);
    }
  }

  async predictSavingsGrowth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'AUTH_TOKEN_MISSING', message: 'Authentication required' },
        });
        return;
      }

      const { months } = req.query;
      const prediction = await predictionService.predictSavingsGrowth(
        userId,
        months ? parseInt(months as string) : 12
      );

      res.status(200).json({ success: true, data: prediction });
    } catch (error: any) {
      logger.error('Predict savings growth error:', error);
      next(error);
    }
  }
}

export const predictionController = new PredictionController();
