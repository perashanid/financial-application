import { Transaction } from '../models/Transaction';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary';
import { autoSaveService } from './autoSaveService';
import mongoose from 'mongoose';

interface CreateTransactionData {
  type: 'debit' | 'credit';
  amount: number;
  category: string;
  date: Date;
  description?: string;
  notes?: string;
  tags?: string[];
  isRecurring?: boolean;
  recurringRule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
  };
}

interface TransactionFilters {
  startDate?: Date;
  endDate?: Date;
  category?: string;
  type?: 'debit' | 'credit';
  keyword?: string;
  minAmount?: number;
  maxAmount?: number;
}

export class TransactionService {
  async createTransaction(userId: string, data: CreateTransactionData) {
    const transaction = await Transaction.create({
      userId,
      ...data,
      metadata: { source: 'manual' },
    });
    
    // Execute auto-save rules asynchronously
    autoSaveService.executeAutoSaveRules(userId, String(transaction._id)).catch((error) => {
      // Log error but don't fail transaction creation
      console.error('Auto-save execution failed:', error);
    });
    
    return transaction.populate('category');
  }

  async getTransactions(
    userId: string,
    filters: TransactionFilters = {},
    page: number = 1,
    limit: number = 20
  ) {
    const query: any = { userId };

    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) query.date.$gte = filters.startDate;
      if (filters.endDate) query.date.$lte = filters.endDate;
    }

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.keyword) {
      query.$or = [
        { description: { $regex: filters.keyword, $options: 'i' } },
        { notes: { $regex: filters.keyword, $options: 'i' } },
      ];
    }

    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      query.amount = {};
      if (filters.minAmount !== undefined) query.amount.$gte = filters.minAmount;
      if (filters.maxAmount !== undefined) query.amount.$lte = filters.maxAmount;
    }

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .populate('category')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments(query),
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getTransactionById(transactionId: string, userId: string) {
    const transaction = await Transaction.findOne({ _id: transactionId, userId }).populate('category');
    if (!transaction) {
      throw new Error('RESOURCE_NOT_FOUND');
    }
    return transaction;
  }

  async updateTransaction(transactionId: string, userId: string, data: Partial<CreateTransactionData>) {
    const transaction = await Transaction.findOne({ _id: transactionId, userId });
    if (!transaction) {
      throw new Error('RESOURCE_NOT_FOUND');
    }

    Object.assign(transaction, data);
    await transaction.save();
    return transaction.populate('category');
  }

  async deleteTransaction(transactionId: string, userId: string) {
    const transaction = await Transaction.findOne({ _id: transactionId, userId });
    if (!transaction) {
      throw new Error('RESOURCE_NOT_FOUND');
    }

    // Delete receipt if exists
    if (transaction.receiptPublicId) {
      try {
        await deleteFromCloudinary(transaction.receiptPublicId);
      } catch (error) {
        // Continue even if deletion fails
      }
    }

    await Transaction.findByIdAndDelete(transactionId);
  }

  async uploadReceipt(transactionId: string, userId: string, fileBuffer: Buffer) {
    const transaction = await Transaction.findOne({ _id: transactionId, userId });
    if (!transaction) {
      throw new Error('RESOURCE_NOT_FOUND');
    }

    // Delete old receipt if exists
    if (transaction.receiptPublicId) {
      try {
        await deleteFromCloudinary(transaction.receiptPublicId);
      } catch (error) {
        // Continue even if deletion fails
      }
    }

    // Upload new receipt
    const { url, publicId } = await uploadToCloudinary(fileBuffer, 'receipts');
    transaction.receiptUrl = url;
    transaction.receiptPublicId = publicId;
    await transaction.save();

    return { receiptUrl: url };
  }

  async getBalance(userId: string) {
    const result = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    const credits = result.find((r) => r._id === 'credit')?.total || 0;
    const debits = result.find((r) => r._id === 'debit')?.total || 0;
    const balance = credits - debits;

    return { balance, credits, debits };
  }
}

export const transactionService = new TransactionService();
