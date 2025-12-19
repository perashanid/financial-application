import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { adminService } from '../services/adminService';
import { campaignService } from '../services/campaignService';
import { activityLogService } from '../services/activityLogService';
import { logger } from '../utils/logger';

export class AdminController {
  async getAllUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const filters = {
        search: req.query.search,
        role: req.query.role,
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
      };

      const result = await adminService.getAllUsers(filters, page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      logger.error('Get all users error:', error);
      next(error);
    }
  }

  async getUserDetails(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminService.getUserDetails(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      logger.error('Get user details error:', error);
      next(error);
    }
  }

  async updateUserStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { isActive } = req.body;
      const user = await adminService.updateUserStatus(req.params.id, isActive);
      res.status(200).json({ success: true, data: user });
    } catch (error: any) {
      logger.error('Update user status error:', error);
      next(error);
    }
  }

  async updateUserRole(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { role } = req.body;
      const user = await adminService.updateUserRole(req.params.id, role);
      res.status(200).json({ success: true, data: user });
    } catch (error: any) {
      logger.error('Update user role error:', error);
      next(error);
    }
  }

  async getPlatformStatistics(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await adminService.getPlatformStatistics();
      res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
      logger.error('Get platform statistics error:', error);
      next(error);
    }
  }

  async getModerationQueue(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const campaigns = await adminService.getModerationQueue();
      res.status(200).json({ success: true, data: campaigns });
    } catch (error: any) {
      logger.error('Get moderation queue error:', error);
      next(error);
    }
  }

  async approveCampaign(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminId = req.user?.userId;
      if (!adminId) {
        res.status(401).json({ success: false, error: { code: 'AUTH_TOKEN_MISSING' } });
        return;
      }

      const campaign = await campaignService.approveCampaign(req.params.id, adminId);
      res.status(200).json({ success: true, data: campaign });
    } catch (error: any) {
      logger.error('Approve campaign error:', error);
      next(error);
    }
  }

  async rejectCampaign(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminId = req.user?.userId;
      if (!adminId) {
        res.status(401).json({ success: false, error: { code: 'AUTH_TOKEN_MISSING' } });
        return;
      }

      const { notes } = req.body;
      const campaign = await campaignService.rejectCampaign(req.params.id, adminId, notes);
      res.status(200).json({ success: true, data: campaign });
    } catch (error: any) {
      logger.error('Reject campaign error:', error);
      next(error);
    }
  }

  async getActivityLogs(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const filters = {
        action: req.query.action,
        resource: req.query.resource,
        status: req.query.status,
        userId: req.query.userId,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      };

      const result = await activityLogService.getSystemActivityLogs(filters, page, limit);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      logger.error('Get activity logs error:', error);
      next(error);
    }
  }
}

export const adminController = new AdminController();
