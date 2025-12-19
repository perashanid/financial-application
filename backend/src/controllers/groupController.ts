import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { groupService } from '../services/groupService';
import { logger } from '../utils/logger';

export class GroupController {
  async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'AUTH_TOKEN_MISSING', message: 'Authentication required' },
        });
        return;
      }

      const { name, description, memberIds } = req.body;

      if (!name) {
        res.status(400).json({
          success: false,
          error: { code: 'MISSING_REQUIRED_FIELD', message: 'Group name is required' },
        });
        return;
      }

      const group = await groupService.createGroup(userId, { name, description, memberIds });
      res.status(201).json({ success: true, data: group });
    } catch (error: any) {
      logger.error('Create group error:', error);
      next(error);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'AUTH_TOKEN_MISSING', message: 'Authentication required' },
        });
        return;
      }

      const groups = await groupService.getGroups(userId);
      res.status(200).json({ success: true, data: groups });
    } catch (error: any) {
      logger.error('Get groups error:', error);
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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

      const group = await groupService.getGroupById(id, userId);
      res.status(200).json({ success: true, data: group });
    } catch (error: any) {
      logger.error('Get group error:', error);
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;
      const { name, description } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'AUTH_TOKEN_MISSING', message: 'Authentication required' },
        });
        return;
      }

      const group = await groupService.updateGroup(id, userId, { name, description });
      res.status(200).json({ success: true, data: group });
    } catch (error: any) {
      logger.error('Update group error:', error);
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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

      await groupService.deleteGroup(id, userId);
      res.status(200).json({ success: true, message: 'Group deleted successfully' });
    } catch (error: any) {
      logger.error('Delete group error:', error);
      next(error);
    }
  }

  async addMember(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;
      const { memberId } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'AUTH_TOKEN_MISSING', message: 'Authentication required' },
        });
        return;
      }

      if (!memberId) {
        res.status(400).json({
          success: false,
          error: { code: 'MISSING_REQUIRED_FIELD', message: 'Member ID is required' },
        });
        return;
      }

      const group = await groupService.addMember(id, userId, memberId);
      res.status(200).json({ success: true, data: group });
    } catch (error: any) {
      logger.error('Add member error:', error);
      next(error);
    }
  }

  async removeMember(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { id, memberId } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'AUTH_TOKEN_MISSING', message: 'Authentication required' },
        });
        return;
      }

      const group = await groupService.removeMember(id, userId, memberId);
      res.status(200).json({ success: true, data: group });
    } catch (error: any) {
      logger.error('Remove member error:', error);
      next(error);
    }
  }

  async addBill(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;
      const { description, totalAmount, paidBy, splits } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'AUTH_TOKEN_MISSING', message: 'Authentication required' },
        });
        return;
      }

      if (!description || !totalAmount || !paidBy || !splits) {
        res.status(400).json({
          success: false,
          error: { code: 'MISSING_REQUIRED_FIELD', message: 'Description, amount, payer, and splits are required' },
        });
        return;
      }

      const group = await groupService.addBill(id, userId, {
        description,
        totalAmount: parseFloat(totalAmount),
        paidBy,
        splits: splits.map((s: any) => ({
          userId: s.userId,
          amount: parseFloat(s.amount),
        })),
      });

      res.status(200).json({ success: true, data: group });
    } catch (error: any) {
      logger.error('Add bill error:', error);
      next(error);
    }
  }

  async recordSettlement(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;
      const { from, to, amount } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'AUTH_TOKEN_MISSING', message: 'Authentication required' },
        });
        return;
      }

      if (!from || !to || !amount) {
        res.status(400).json({
          success: false,
          error: { code: 'MISSING_REQUIRED_FIELD', message: 'From, to, and amount are required' },
        });
        return;
      }

      const group = await groupService.recordSettlement(id, userId, {
        from,
        to,
        amount: parseFloat(amount),
      });

      res.status(200).json({ success: true, data: group });
    } catch (error: any) {
      logger.error('Record settlement error:', error);
      next(error);
    }
  }

  async getBalance(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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

      const balance = await groupService.getGroupBalance(id, userId);
      res.status(200).json({ success: true, data: balance });
    } catch (error: any) {
      logger.error('Get group balance error:', error);
      next(error);
    }
  }
}

export const groupController = new GroupController();
