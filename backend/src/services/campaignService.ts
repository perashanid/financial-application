import { Campaign } from '../models/Campaign';
import { Payment } from '../models/Payment';
import mongoose from 'mongoose';

interface CreateCampaignData {
  title: string;
  description: string;
  targetAmount: number;
  category: string;
  endDate: Date;
  images?: string[];
}

interface ContributeData {
  amount: number;
  paymentId: string;
  isAnonymous?: boolean;
}

export class CampaignService {
  async createCampaign(userId: string, data: CreateCampaignData) {
    const campaign = await Campaign.create({
      ...data,
      creatorId: userId,
      status: 'pending',
      moderationStatus: 'pending',
    });
    return campaign;
  }

  async getCampaigns(filters: any = {}, page: number = 1, limit: number = 20) {
    const query: any = { status: 'active', moderationStatus: 'approved' };

    if (filters.category) query.category = filters.category;
    if (filters.creatorId) query.creatorId = filters.creatorId;

    const skip = (page - 1) * limit;

    const [campaigns, total] = await Promise.all([
      Campaign.find(query)
        .populate('creatorId', 'name email profilePhoto')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Campaign.countDocuments(query),
    ]);

    return {
      campaigns,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getCampaignById(campaignId: string) {
    const campaign = await Campaign.findById(campaignId)
      .populate('creatorId', 'name email profilePhoto')
      .populate('contributions.userId', 'name profilePhoto');

    if (!campaign) {
      throw new Error('RESOURCE_NOT_FOUND');
    }
    return campaign;
  }

  async updateCampaign(campaignId: string, userId: string, data: Partial<CreateCampaignData>) {
    const campaign = await Campaign.findOne({ _id: campaignId, creatorId: userId });
    if (!campaign) {
      throw new Error('RESOURCE_NOT_FOUND');
    }

    if (campaign.status !== 'draft' && campaign.status !== 'pending') {
      throw new Error('FORBIDDEN_ACTION');
    }

    Object.assign(campaign, data);
    await campaign.save();
    return campaign;
  }

  async deleteCampaign(campaignId: string, userId: string) {
    const campaign = await Campaign.findOne({ _id: campaignId, creatorId: userId });
    if (!campaign) {
      throw new Error('RESOURCE_NOT_FOUND');
    }

    if (campaign.raisedAmount > 0) {
      throw new Error('CANNOT_DELETE_CAMPAIGN_WITH_CONTRIBUTIONS');
    }

    campaign.status = 'cancelled';
    await campaign.save();
  }

  async contribute(campaignId: string, userId: string, data: ContributeData) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const campaign = await Campaign.findById(campaignId).session(session);
      if (!campaign) {
        throw new Error('RESOURCE_NOT_FOUND');
      }

      if (campaign.status !== 'active' || campaign.moderationStatus !== 'approved') {
        throw new Error('CAMPAIGN_NOT_ACTIVE');
      }

      // Verify payment
      const payment = await Payment.findOne({
        _id: data.paymentId,
        userId,
        status: 'completed',
      }).session(session);

      if (!payment) {
        throw new Error('PAYMENT_NOT_FOUND_OR_INCOMPLETE');
      }

      // Add contribution
      campaign.contributions.push({
        userId: new mongoose.Types.ObjectId(userId),
        amount: data.amount,
        paymentId: new mongoose.Types.ObjectId(data.paymentId),
        date: new Date(),
        isAnonymous: data.isAnonymous || false,
      });

      campaign.raisedAmount += data.amount;

      // Check if goal is reached
      if (campaign.raisedAmount >= campaign.targetAmount) {
        campaign.status = 'completed';
      }

      await campaign.save({ session });
      await session.commitTransaction();

      return campaign;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async addUpdate(campaignId: string, userId: string, title: string, content: string) {
    const campaign = await Campaign.findOne({ _id: campaignId, creatorId: userId });
    if (!campaign) {
      throw new Error('RESOURCE_NOT_FOUND');
    }

    campaign.updates.push({
      title,
      content,
      date: new Date(),
    });

    await campaign.save();
    return campaign;
  }

  async flagCampaign(campaignId: string, userId: string, reason: string) {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      throw new Error('RESOURCE_NOT_FOUND');
    }

    campaign.flags.push({
      userId: new mongoose.Types.ObjectId(userId),
      reason,
      date: new Date(),
    });

    if (campaign.flags.length >= 5) {
      campaign.moderationStatus = 'flagged';
    }

    await campaign.save();
    return campaign;
  }

  // Admin functions
  async approveCampaign(campaignId: string, adminId: string) {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      throw new Error('RESOURCE_NOT_FOUND');
    }

    campaign.moderationStatus = 'approved';
    campaign.status = 'active';
    campaign.moderatedBy = new mongoose.Types.ObjectId(adminId);
    campaign.moderatedAt = new Date();

    await campaign.save();
    return campaign;
  }

  async rejectCampaign(campaignId: string, adminId: string, notes: string) {
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      throw new Error('RESOURCE_NOT_FOUND');
    }

    campaign.moderationStatus = 'rejected';
    campaign.status = 'rejected';
    campaign.moderationNotes = notes;
    campaign.moderatedBy = new mongoose.Types.ObjectId(adminId);
    campaign.moderatedAt = new Date();

    await campaign.save();
    return campaign;
  }
}

export const campaignService = new CampaignService();
