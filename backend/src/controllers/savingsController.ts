import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { savingsService } from '../services/savingsService';
import { logger } from '../utils/logger';

export class SavingsController {
  async createGoal(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'AUTH_TOKEN_MISSING', message: 'Authentication required' },
        });
        return;
      }

      const { name, targetAmount, targetDate } = req.body;

      if (!name || !targetAmount) {
        res.status(400).json({
          success: false,
          error: { code: 'MISSING_REQUIRED_FIELD', message: 'Name and target amount are required' },
        });
        return;
      }

      const goal = await savingsService.createGoal(userId, {
        name,
        targetAmount: parseFloat(targetAmount),
        targetDate: targetDate ? new Date(targetDate) : undefined,
      });

      res.status(201).json({ success: true, data: goal });
    } catch (error: any) {
      logger.error('Create savings goal error:', error);
      next(error);
    }
  }

  async getGoals(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'AUTH_TOKEN_MISSING', message: 'Authentication required' },
        });
        return;
      }

      const { status } = req.query;
      const goals = await savingsService.getGoals(userId, status as any);
      res.status(200).json({ success: true, data: goals });
    } catch (error: any) {
      logger.error('Get savings goals error:', error);
      next(error);
    }
  }

  async getGoalById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'AUTH_TOKEN_MISSING', message: 'Authentication required' },
        });
        return;
      }

      const goal = await savingsService.getGoalById(id, userId);
      res.status(200).json({ success: true, data: goal });
    } catch (error: any) {
      logger.error('Get savings goal error:', error);
      next(error);
    }
  }

  async updateGoal(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;
      const { name, targetAmount, targetDate } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'AUTH_TOKEN_MISSING', message: 'Authentication required' },
        });
        return;
      }

      const updateData: any = {};
      if (name) updateData.name = name;
      if (targetAmount) updateData.targetAmount = parseFloat(targetAmount);
      if (targetDate) updateData.targetDate = new Date(targetDate);

      const goal = await savingsService.updateGoal(id, userId, updateData);
      res.status(200).json({ success: true, data: goal });
    } catch (error: any) {
      logger.error('Update savings goal error:', error);
      next(error);
    }
  }

  async deleteGoal(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'AUTH_TOKEN_MISSING', message: 'Authentication required' },
        });
        return;
      }

      await savingsService.deleteGoal(id, userId);
      res.status(200).json({ success: true, message: 'Savings goal deleted successfully' });
    } catch (error: any) {
      logger.error('Delete savings goal error:', error);
      next(error);
    }
  }

  async addRule(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;
      const { type, value, frequency } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'AUTH_TOKEN_MISSING', message: 'Authentication required' },
        });
        return;
      }

      if (!type || !value) {
        res.status(400).json({
          success: false,
          error: { code: 'MISSING_REQUIRED_FIELD', message: 'Type and value are required' },
        });
        return;
      }

      const goal = await savingsService.addRule(id, userId, { type, value: parseFloat(value), frequency });
      res.status(200).json({ success: true, data: goal });
    } catch (error: any) {
      logger.error('Add savings rule error:', error);
      next(error);
    }
  }

  async updateRule(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { id, ruleIndex } = req.params;
      const { type, value, frequency, isActive } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'AUTH_TOKEN_MISSING', message: 'Authentication required' },
        });
        return;
      }

      const updateData: any = {};
      if (type) updateData.type = type;
      if (value) updateData.value = parseFloat(value);
      if (frequency) updateData.frequency = frequency;
      if (isActive !== undefined) updateData.isActive = isActive;

      const goal = await savingsService.updateRule(id, userId, parseInt(ruleIndex), updateData);
      res.status(200).json({ success: true, data: goal });
    } catch (error: any) {
      logger.error('Update savings rule error:', error);
      next(error);
    }
  }

  async deleteRule(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { id, ruleIndex } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'AUTH_TOKEN_MISSING', message: 'Authentication required' },
        });
        return;
      }

      const goal = await savingsService.deleteRule(id, userId, parseInt(ruleIndex));
      res.status(200).json({ success: true, data: goal });
    } catch (error: any) {
      logger.error('Delete savings rule error:', error);
      next(error);
    }
  }

  async contribute(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;
      const { amount } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'AUTH_TOKEN_MISSING', message: 'Authentication required' },
        });
        return;
      }

      if (!amount) {
        res.status(400).json({
          success: false,
          error: { code: 'MISSING_REQUIRED_FIELD', message: 'Amount is required' },
        });
        return;
      }

      const goal = await savingsService.contribute(id, userId, { amount: parseFloat(amount) });
      res.status(200).json({ success: true, data: goal });
    } catch (error: any) {
      logger.error('Contribute to savings goal error:', error);
      next(error);
    }
  }
}

export const savingsController = new SavingsController();
