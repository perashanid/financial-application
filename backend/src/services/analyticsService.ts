import { Transaction } from '../models/Transaction';
import { SavingsGoal } from '../models/SavingsGoal';
import { Loan } from '../models/Loan';
import { safeRedis } from '../config/redis';
import mongoose from 'mongoose';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export class AnalyticsService {
  async getDashboardSummary(userId: string) {
    const cacheKey = `dashboard:${userId}`;
    
    // Try to get from cache
    const cached = await safeRedis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Calculate balance
    const balanceResult = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    const credits = balanceResult.find((r) => r._id === 'credit')?.total || 0;
    const debits = balanceResult.find((r) => r._id === 'debit')?.total || 0;
    const balance = credits - debits;

    // Get monthly trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrends = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Get category breakdown
    const categoryBreakdown = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          type: 'debit',
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
    ]);

    // Get savings summary
    const savingsGoals = await SavingsGoal.find({ userId, status: 'active' });
    const totalSavingsTarget = savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    const totalSavingsCurrent = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);

    // Get loan summary
    const activeLoans = await Loan.find({ userId, status: { $in: ['active', 'overdue'] } });
    const totalLoanAmount = activeLoans.reduce((sum, loan) => sum + loan.remainingBalance, 0);

    const summary = {
      balance,
      income: credits,
      expenses: debits,
      monthlyTrends,
      categoryBreakdown,
      savings: {
        totalTarget: totalSavingsTarget,
        totalCurrent: totalSavingsCurrent,
        progress: totalSavingsTarget > 0 ? (totalSavingsCurrent / totalSavingsTarget) * 100 : 0,
        activeGoals: savingsGoals.length,
      },
      loans: {
        totalOutstanding: totalLoanAmount,
        activeLoans: activeLoans.length,
      },
      savingsRate: credits > 0 ? (totalSavingsCurrent / credits) * 100 : 0,
    };

    // Cache for 5 minutes
    await safeRedis.setEx(cacheKey, 300, JSON.stringify(summary));

    return summary;
  }

  async getCategoryBreakdown(userId: string, startDate?: Date, endDate?: Date) {
    const match: any = { userId: new mongoose.Types.ObjectId(userId) };
    
    if (startDate || endDate) {
      match.date = {};
      if (startDate) match.date.$gte = startDate;
      if (endDate) match.date.$lte = endDate;
    }

    const breakdown = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: { category: '$category', type: '$type' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id.category',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      { $sort: { total: -1 } },
    ]);

    // Calculate total and percentages
    const totalAmount = breakdown.reduce((sum, item) => sum + item.total, 0);
    
    return breakdown.map((item, index) => ({
      category: item.category.name,
      amount: item.total,
      percentage: totalAmount > 0 ? (item.total / totalAmount) * 100 : 0,
      color: COLORS[index % COLORS.length] || '#4F46E5',
    }));
  }

  async getMonthlyTrends(userId: string, months: number = 12) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const trends = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    return trends;
  }

  async getSavingsVsExpensesRatio(userId: string) {
    const result = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    const income = result.find((r) => r._id === 'credit')?.total || 0;
    const expenses = result.find((r) => r._id === 'debit')?.total || 0;

    const savingsGoals = await SavingsGoal.find({ userId });
    const totalSavings = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);

    return {
      income,
      expenses,
      savings: totalSavings,
      savingsRate: income > 0 ? (totalSavings / income) * 100 : 0,
      expenseRate: income > 0 ? (expenses / income) * 100 : 0,
    };
  }

  async invalidateCache(userId: string) {
    await safeRedis.del(`dashboard:${userId}`);
  }
}

export const analyticsService = new AnalyticsService();
