import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { transactionService } from '../services/transactionService';
import { logger } from '../utils/logger';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

export class TransactionController {
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

      const { type, amount, category, date, description, notes, tags, isRecurring, recurringRule } = req.body;

      if (!type || !amount || !category || !date) {
        res.status(400).json({
          success: false,
          error: { code: 'MISSING_REQUIRED_FIELD', message: 'Type, amount, category, and date are required' },
        });
        return;
      }

      const transaction = await transactionService.createTransaction(userId, {
        type,
        amount: parseFloat(amount),
        category,
        date: new Date(date),
        description,
        notes,
        tags,
        isRecurring,
        recurringRule,
      });

      res.status(201).json({ success: true, data: transaction });
    } catch (error: any) {
      logger.error('Create transaction error:', error);
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

      const { startDate, endDate, category, type, keyword, minAmount, maxAmount, page, limit } = req.query;

      const filters: any = {};
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (category) filters.category = category;
      if (type) filters.type = type;
      if (keyword) filters.keyword = keyword;
      if (minAmount) filters.minAmount = parseFloat(minAmount as string);
      if (maxAmount) filters.maxAmount = parseFloat(maxAmount as string);

      const result = await transactionService.getTransactions(
        userId,
        filters,
        page ? parseInt(page as string) : 1,
        limit ? parseInt(limit as string) : 20
      );

      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      logger.error('Get transactions error:', error);
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

      const transaction = await transactionService.getTransactionById(id, userId);
      res.status(200).json({ success: true, data: transaction });
    } catch (error: any) {
      logger.error('Get transaction error:', error);
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;
      const { type, amount, category, date, description, notes, tags, isRecurring, recurringRule } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'AUTH_TOKEN_MISSING', message: 'Authentication required' },
        });
        return;
      }

      const updateData: any = {};
      if (type) updateData.type = type;
      if (amount) updateData.amount = parseFloat(amount);
      if (category) updateData.category = category;
      if (date) updateData.date = new Date(date);
      if (description !== undefined) updateData.description = description;
      if (notes !== undefined) updateData.notes = notes;
      if (tags) updateData.tags = tags;
      if (isRecurring !== undefined) updateData.isRecurring = isRecurring;
      if (recurringRule) updateData.recurringRule = recurringRule;

      const transaction = await transactionService.updateTransaction(id, userId, updateData);
      res.status(200).json({ success: true, data: transaction });
    } catch (error: any) {
      logger.error('Update transaction error:', error);
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

      await transactionService.deleteTransaction(id, userId);
      res.status(200).json({ success: true, message: 'Transaction deleted successfully' });
    } catch (error: any) {
      logger.error('Delete transaction error:', error);
      next(error);
    }
  }

  async uploadReceipt(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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

      if (!req.file) {
        res.status(400).json({
          success: false,
          error: { code: 'MISSING_REQUIRED_FIELD', message: 'Receipt file is required' },
        });
        return;
      }

      const result = await transactionService.uploadReceipt(id, userId, req.file.buffer);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      logger.error('Upload receipt error:', error);
      next(error);
    }
  }

  async getBalance(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: { code: 'AUTH_TOKEN_MISSING', message: 'Authentication required' },
        });
        return;
      }

      const balance = await transactionService.getBalance(userId);
      res.status(200).json({ success: true, data: balance });
    } catch (error: any) {
      logger.error('Get balance error:', error);
      next(error);
    }
  }
}

export const transactionController = new TransactionController();
export { upload };
