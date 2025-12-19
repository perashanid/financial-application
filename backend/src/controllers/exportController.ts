import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { exportService } from '../services/exportService';
import { logger } from '../utils/logger';

export class ExportController {
  async exportCSV(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: { code: 'AUTH_TOKEN_MISSING' } });
        return;
      }

      const filters = {
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        category: req.query.category as string,
        type: req.query.type as 'debit' | 'credit',
      };

      const csv = await exportService.exportTransactionsCSV(userId, filters);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
      res.status(200).send(csv);
    } catch (error: any) {
      logger.error('Export CSV error:', error);
      next(error);
    }
  }

  async generateMonthlyReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, error: { code: 'AUTH_TOKEN_MISSING' } });
        return;
      }

      const month = parseInt(req.params.month);
      const year = parseInt(req.params.year);

      if (!month || !year || month < 1 || month > 12) {
        res.status(400).json({ success: false, error: { code: 'INVALID_PARAMETERS' } });
        return;
      }

      const pdf = await exportService.generateMonthlyReportPDF(userId, month, year);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=report-${year}-${month}.pdf`);
      res.status(200).send(pdf);
    } catch (error: any) {
      logger.error('Generate report error:', error);
      next(error);
    }
  }
}

export const exportController = new ExportController();
