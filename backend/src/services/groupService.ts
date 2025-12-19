import { Group } from '../models/Group';
import { Transaction } from '../models/Transaction';
import mongoose from 'mongoose';

interface CreateGroupData {
  name: string;
  description?: string;
  memberIds?: string[];
}

interface AddBillData {
  description: string;
  totalAmount: number;
  paidBy: string;
  splits: Array<{
    userId: string;
    amount: number;
  }>;
}

interface RecordSettlementData {
  from: string;
  to: string;
  amount: number;
}

export class GroupService {
  async createGroup(userId: string, data: CreateGroupData) {
    const members = [
      {
        userId: new mongoose.Types.ObjectId(userId),
        joinedAt: new Date(),
        balance: 0,
        isActive: true,
      },
    ];

    // Add additional members if provided
    if (data.memberIds && data.memberIds.length > 0) {
      for (const memberId of data.memberIds) {
        if (memberId !== userId) {
          members.push({
            userId: new mongoose.Types.ObjectId(memberId),
            joinedAt: new Date(),
            balance: 0,
            isActive: true,
          });
        }
      }
    }

    const group = await Group.create({
      name: data.name,
      description: data.description,
      createdBy: userId,
      members,
    });

    return group.populate('members.userId', 'name email');
  }

  async getGroups(userId: string) {
    const groups = await Group.find({
      'members.userId': userId,
      isActive: true,
    })
      .populate('createdBy', 'name email')
      .populate('members.userId', 'name email')
      .sort({ createdAt: -1 });

    return groups;
  }

  async getGroupById(groupId: string, userId: string) {
    const group = await Group.findOne({
      _id: groupId,
      'members.userId': userId,
    })
      .populate('createdBy', 'name email')
      .populate('members.userId', 'name email')
      .populate('bills.paidBy', 'name email')
      .populate('bills.splits.userId', 'name email');

    if (!group) {
      throw new Error('RESOURCE_NOT_FOUND');
    }

    return group;
  }

  async updateGroup(groupId: string, userId: string, data: Partial<CreateGroupData>) {
    const group = await Group.findOne({ _id: groupId, createdBy: userId });
    if (!group) {
      throw new Error('RESOURCE_NOT_FOUND');
    }

    if (data.name) group.name = data.name;
    if (data.description !== undefined) group.description = data.description;

    await group.save();
    return group.populate('members.userId', 'name email');
  }

  async deleteGroup(groupId: string, userId: string) {
    const group = await Group.findOne({ _id: groupId, createdBy: userId });
    if (!group) {
      throw new Error('RESOURCE_NOT_FOUND');
    }

    group.isActive = false;
    await group.save();
  }

  async addMember(groupId: string, userId: string, newMemberId: string) {
    const group = await Group.findOne({ _id: groupId, createdBy: userId });
    if (!group) {
      throw new Error('RESOURCE_NOT_FOUND');
    }

    // Check if member already exists
    const existingMember = group.members.find(
      (m) => m.userId.toString() === newMemberId
    );

    if (existingMember) {
      if (!existingMember.isActive) {
        existingMember.isActive = true;
      } else {
        throw new Error('MEMBER_ALREADY_EXISTS');
      }
    } else {
      group.members.push({
        userId: new mongoose.Types.ObjectId(newMemberId),
        joinedAt: new Date(),
        balance: 0,
        isActive: true,
      });
    }

    await group.save();
    return group.populate('members.userId', 'name email');
  }

  async removeMember(groupId: string, userId: string, memberId: string) {
    const group = await Group.findOne({ _id: groupId, createdBy: userId });
    if (!group) {
      throw new Error('RESOURCE_NOT_FOUND');
    }

    const member = group.members.find((m) => m.userId.toString() === memberId);
    if (!member) {
      throw new Error('MEMBER_NOT_FOUND');
    }

    if (member.balance !== 0) {
      throw new Error('MEMBER_HAS_OUTSTANDING_BALANCE');
    }

    member.isActive = false;
    await group.save();
    return group.populate('members.userId', 'name email');
  }

  async addBill(groupId: string, userId: string, data: AddBillData) {
    const group = await Group.findOne({
      _id: groupId,
      'members.userId': userId,
    });

    if (!group) {
      throw new Error('RESOURCE_NOT_FOUND');
    }

    // Validate splits
    const totalSplits = data.splits.reduce((sum, split) => sum + split.amount, 0);
    if (Math.abs(totalSplits - data.totalAmount) > 0.01) {
      throw new Error('SPLIT_AMOUNTS_MISMATCH');
    }

    // Add bill
    group.bills.push({
      description: data.description,
      totalAmount: data.totalAmount,
      paidBy: new mongoose.Types.ObjectId(data.paidBy),
      date: new Date(),
      splits: data.splits.map((split) => ({
        userId: new mongoose.Types.ObjectId(split.userId),
        amount: split.amount,
        isPaid: split.userId === data.paidBy,
        paidAt: split.userId === data.paidBy ? new Date() : undefined,
      })),
      createdAt: new Date(),
    });

    // Update member balances
    for (const split of data.splits) {
      const member = group.members.find((m) => m.userId.toString() === split.userId);
      if (member) {
        if (split.userId === data.paidBy) {
          member.balance += data.totalAmount - split.amount;
        } else {
          member.balance -= split.amount;
        }
      }
    }

    await group.save();
    return group.populate('bills.paidBy', 'name email');
  }

  async recordSettlement(groupId: string, userId: string, data: RecordSettlementData) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const group = await Group.findOne({
        _id: groupId,
        'members.userId': userId,
      }).session(session);

      if (!group) {
        throw new Error('RESOURCE_NOT_FOUND');
      }

      // Update member balances
      const fromMember = group.members.find((m) => m.userId.toString() === data.from);
      const toMember = group.members.find((m) => m.userId.toString() === data.to);

      if (!fromMember || !toMember) {
        throw new Error('MEMBER_NOT_FOUND');
      }

      fromMember.balance += data.amount;
      toMember.balance -= data.amount;

      // Add settlement record
      group.settlements.push({
        from: new mongoose.Types.ObjectId(data.from),
        to: new mongoose.Types.ObjectId(data.to),
        amount: data.amount,
        date: new Date(),
      });

      await group.save({ session });

      // Create transaction record
      const category = await mongoose.model('Category').findOne({ name: 'Other Expense', isDefault: true });
      if (category) {
        await Transaction.create(
          [
            {
              userId: data.from,
              type: 'debit',
              amount: data.amount,
              category: category._id,
              date: new Date(),
              description: `Settlement payment to group: ${group.name}`,
              metadata: {
                source: 'group-bill',
                relatedId: group._id,
              },
            },
          ],
          { session }
        );
      }

      await session.commitTransaction();
      return group;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getGroupBalance(groupId: string, userId: string) {
    const group = await Group.findOne({
      _id: groupId,
      'members.userId': userId,
    }).populate('members.userId', 'name email');

    if (!group) {
      throw new Error('RESOURCE_NOT_FOUND');
    }

    const balances = group.members
      .filter((m) => m.isActive)
      .map((m) => ({
        user: m.userId,
        balance: m.balance,
      }));

    // Calculate who owes whom
    const settlements = this.calculateOptimalSettlements(balances);

    return {
      balances,
      suggestedSettlements: settlements,
    };
  }

  private calculateOptimalSettlements(balances: Array<{ user: any; balance: number }>) {
    const creditors = balances.filter((b) => b.balance > 0).sort((a, b) => b.balance - a.balance);
    const debtors = balances.filter((b) => b.balance < 0).sort((a, b) => a.balance - b.balance);

    const settlements = [];
    let i = 0;
    let j = 0;

    while (i < creditors.length && j < debtors.length) {
      const creditor = creditors[i];
      const debtor = debtors[j];

      const amount = Math.min(creditor.balance, Math.abs(debtor.balance));

      if (amount > 0.01) {
        settlements.push({
          from: debtor.user,
          to: creditor.user,
          amount: Math.round(amount * 100) / 100,
        });
      }

      creditor.balance -= amount;
      debtor.balance += amount;

      if (creditor.balance < 0.01) i++;
      if (Math.abs(debtor.balance) < 0.01) j++;
    }

    return settlements;
  }
}

export const groupService = new GroupService();
