import { User } from '../models/User';
import { Transaction } from '../models/Transaction';
import { Campaign } from '../models/Campaign';
import { ActivityLog } from '../models/ActivityLog';
import mongoose from 'mongoose';

export class AdminService {
  async getAllUsers(filters: any = {}, page: number = 1, limit: number = 20) {
    const query: any = {};

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
      ];
    }

    if (filters.role) query.role = filters.role;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query).select('-passwordHash -twoFactorSecret').sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getUserDetails(userId: string) {
    const user = await User.findById(userId).select('-passwordHash -twoFactorSecret');
    if (!user) {
      throw new Error('RESOURCE_NOT_FOUND');
    }

    // Get user statistics
    const [transactionCount, totalIncome, totalExpenses] = await Promise.all([
      Transaction.countDocuments({ userId }),
      Transaction.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId), type: 'credit' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]).then((result) => result[0]?.total || 0),
      Transaction.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId), type: 'debit' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]).then((result) => result[0]?.total || 0),
    ]);

    return {
      user,
      statistics: {
        transactionCount,
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
      },
    };
  }

  async updateUserStatus(userId: string, isActive: boolean) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('RESOURCE_NOT_FOUND');
    }

    user.isActive = isActive;
    await user.save();

    return user;
  }

  async updateUserRole(userId: string, role: 'individual' | 'business' | 'admin') {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('RESOURCE_NOT_FOUND');
    }

    user.role = role;
    await user.save();

    return user;
  }

  async getPlatformStatistics() {
    const [
      totalUsers,
      activeUsers,
      totalTransactions,
      totalVolume,
      activeCampaigns,
      totalCampaignRaised,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Transaction.countDocuments(),
      Transaction.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]).then(
        (result) => result[0]?.total || 0
      ),
      Campaign.countDocuments({ status: 'active' }),
      Campaign.aggregate([{ $group: { _id: null, total: { $sum: '$raisedAmount' } } }]).then(
        (result) => result[0]?.total || 0
      ),
    ]);

    // User growth (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Transaction volume (last 12 months)
    const transactionVolume = await Transaction.aggregate([
      { $match: { date: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          count: { $sum: 1 },
          volume: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        growth: userGrowth,
      },
      transactions: {
        total: totalTransactions,
        volume: totalVolume,
        monthlyVolume: transactionVolume,
      },
      campaigns: {
        active: activeCampaigns,
        totalRaised: totalCampaignRaised,
      },
    };
  }

  async getModerationQueue() {
    const campaigns = await Campaign.find({
      moderationStatus: { $in: ['pending', 'flagged'] },
    })
      .populate('creatorId', 'name email')
      .sort({ createdAt: -1 });

    return campaigns;
  }

  async getRecentActivity(limit: number = 50) {
    const activities = await ActivityLog.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit);

    return activities;
  }
}

export const adminService = new AdminService();
