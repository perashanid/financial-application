import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { activityLogService } from '../services/activityLogService';

export const logActivity = (action: string, resource: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const originalSend = res.send;

    res.send = function (data: any) {
      const userId = req.user?.userId;
      const status = res.statusCode >= 200 && res.statusCode < 300 ? 'success' : 'failure';

      activityLogService.logActivity({
        userId,
        action,
        resource,
        resourceId: req.params.id,
        details: {
          method: req.method,
          path: req.path,
          body: req.body,
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        status,
        errorMessage: status === 'failure' ? data : undefined,
      });

      return originalSend.call(this, data);
    };

    next();
  };
};
