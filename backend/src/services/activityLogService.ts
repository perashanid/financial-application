import { ActivityLog } from '../models/ActivityLog';

interface LogActivityData {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure';
  errorMessage?: string;
}

export class ActivityLogService {
  async logActivity(data: LogActivityData) {
    try {
      await ActivityLog.create(data);
    } catch (error) {
      // Don't throw errors for logging failures
      console.error('Failed to log activity:', error);
    }
  }

  async getUserActivityLogs(userId: string, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      ActivityLog.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      ActivityLog.countDocuments({ userId }),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getSystemActivityLogs(filters: any = {}, page: number = 1, limit: number = 50) {
    const query: any = {};

    if (filters.action) query.action = filters.action;
    if (filters.resource) query.resource = filters.resource;
    if (filters.status) query.status = filters.status;
    if (filters.userId) query.userId = filters.userId;

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = filters.startDate;
      if (filters.endDate) query.createdAt.$lte = filters.endDate;
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      ActivityLog.find(query)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ActivityLog.countDocuments(query),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getSecurityEvents(userId?: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const query: any = {
      action: { $in: ['login', 'logout', 'failed_login', 'password_change', '2fa_enabled', '2fa_disabled'] },
      createdAt: { $gte: startDate },
    };

    if (userId) query.userId = userId;

    const events = await ActivityLog.find(query).sort({ createdAt: -1 }).limit(100);

    return events;
  }
}

export const activityLogService = new ActivityLogService();
