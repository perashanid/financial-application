import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { notificationService } from '../services/notificationService';

export const notificationController = {
  async getNotifications(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { read, limit } = req.query;

      const filter: any = { user: userId };
      if (read !== undefined) {
        filter.read = read === 'true';
      }

      const notifications = await notificationService.getNotifications(
        filter,
        limit ? parseInt(limit as string) : undefined
      );

      res.json({
        success: true,
        data: notifications,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch notifications',
      });
    }
  },

  async markAsRead(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const notification = await notificationService.markAsRead(id, userId);

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found',
        });
      }

      return res.json({
        success: true,
        data: notification,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to mark notification as read',
      });
    }
  },

  async markAllAsRead(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;

      const result = await notificationService.markAllAsRead(userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to mark all notifications as read',
      });
    }
  },

  async deleteNotification(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const result = await notificationService.deleteNotification(id, userId);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found',
        });
      }

      return res.json({
        success: true,
        message: 'Notification deleted successfully',
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete notification',
      });
    }
  },
};
