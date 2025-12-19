import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { loanService } from '../services/loanService';
import { logger } from '../utils/logger';

export class LoanController {
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

      const { loanType, counterparty, principal, interestRate, interestType, startDate, dueDate, emiAmount, emiFrequency, notes } = req.body;

      if (!loanType || !counterparty || !principal || !startDate) {
        res.status(400).json({
          success: false,
          error: { code: 'MISSING_REQUIRED_FIELD', message: 'Loan type, counterparty, principal, and start date are required' },
        });
        return;
      }

      const loan = await loanService.createLoan(userId, {
        loanType,
        counterparty,
        principal: parseFloat(principal),
        interestRate: interestRate ? parseFloat(interestRate) : undefined,
        interestType,
        startDate: new Date(startDate),
        dueDate: dueDate ? new Date(dueDate) : undefined,
        emiAmount: emiAmount ? parseFloat(emiAmount) : undefined,
        emiFrequency,
        notes,
      });

      res.status(201).json({ success: true, data: loan });
    } catch (error: any) {
      logger.error('Create loan error:', error);
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

      const { status } = req.query;
      const loans = await loanService.getLoans(userId, status as any);
      res.status(200).json({ success: true, data: loans });
    } catch (error: any) {
      logger.error('Get loans error:', error);
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

      const loan = await loanService.getLoanById(id, userId);
      res.status(200).json({ success: true, data: loan });
    } catch (error: any) {
      logger.error('Get loan error:', error);
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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

      const updateData: any = {};
      const { counterparty, interestRate, interestType, dueDate, emiAmount, emiFrequency, notes } = req.body;

      if (counterparty) updateData.counterparty = counterparty;
      if (interestRate !== undefined) updateData.interestRate = parseFloat(interestRate);
      if (interestType) updateData.interestType = interestType;
      if (dueDate) updateData.dueDate = new Date(dueDate);
      if (emiAmount !== undefined) updateData.emiAmount = parseFloat(emiAmount);
      if (emiFrequency) updateData.emiFrequency = emiFrequency;
      if (notes !== undefined) updateData.notes = notes;

      const loan = await loanService.updateLoan(id, userId, updateData);
      res.status(200).json({ success: true, data: loan });
    } catch (error: any) {
      logger.error('Update loan error:', error);
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

      await loanService.deleteLoan(id, userId);
      res.status(200).json({ success: true, message: 'Loan deleted successfully' });
    } catch (error: any) {
      logger.error('Delete loan error:', error);
      next(error);
    }
  }

  async recordPayment(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;
      const { amount, date } = req.body;

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

      const loan = await loanService.recordPayment(id, userId, {
        amount: parseFloat(amount),
        date: date ? new Date(date) : undefined,
      });

      res.status(200).json({ success: true, data: loan });
    } catch (error: any) {
      logger.error('Record loan payment error:', error);
      next(error);
    }
  }

  async calculateInterest(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { principal, rate, type, startDate, endDate } = req.query;

      if (!principal || !rate || !type || !startDate || !endDate) {
        res.status(400).json({
          success: false,
          error: { code: 'MISSING_REQUIRED_FIELD', message: 'All parameters are required' },
        });
        return;
      }

      const interest = loanService.calculateInterest(
        parseFloat(principal as string),
        parseFloat(rate as string),
        type as 'simple' | 'compound',
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.status(200).json({ success: true, data: { interest } });
    } catch (error: any) {
      logger.error('Calculate interest error:', error);
      next(error);
    }
  }

  async calculateEMI(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { principal, rate, months } = req.query;

      if (!principal || !rate || !months) {
        res.status(400).json({
          success: false,
          error: { code: 'MISSING_REQUIRED_FIELD', message: 'Principal, rate, and months are required' },
        });
        return;
      }

      const emi = loanService.calculateEMI(
        parseFloat(principal as string),
        parseFloat(rate as string),
        parseInt(months as string)
      );

      res.status(200).json({ success: true, data: { emi } });
    } catch (error: any) {
      logger.error('Calculate EMI error:', error);
      next(error);
    }
  }
}

export const loanController = new LoanController();
