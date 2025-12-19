import { SavingsGoal } from '../models/SavingsGoal';
import { Transaction } from '../models/Transaction';
import mongoose from 'mongoose';

interface CreateGoalData {
  name: string;
  targetAmount: number;
  targetDate?: Date;
}

interface AddRuleData {
  type: 'percentage' | 'roundup' | 'scheduled';
  value: number;
  frequency?: 'daily' | 'weekly' | 'monthly';
}

interface ContributeData {
  amount: number;
  source?: 'manual' | 'auto-percentage' | 'auto-roundup' | 'auto-scheduled';
}

export class SavingsService {
  async createGoal(userId: string, data: CreateGoalData) {
    const goal = await SavingsGoal.create({
      userId,
      ...data,
    });
    return goal;
  }

  async getGoals(userId: string, status?: 'active' | 'completed' | 'cancelled') {
    const query: any = { userId };
    if (status) query.status = status;

    const goals = await SavingsGoal.find(query).sort({ createdAt: -1 });
    return goals;
  }

  async getGoalById(goalId: string, userId: string) {
    const goal = await SavingsGoal.findOne({ _id: goalId, userId });
    if (!goal) {
      throw new Error('RESOURCE_NOT_FOUND');
    }
    return goal;
  }

  async updateGoal(goalId: string, userId: string, data: Partial<CreateGoalData>) {
    const goal = await SavingsGoal.findOne({ _id: goalId, userId });
    if (!goal) {
      throw new Error('RESOURCE_NOT_FOUND');
    }

    if (goal.status !== 'active') {
      throw new Error('FORBIDDEN_ACTION');
    }

    Object.assign(goal, data);
    await goal.save();
    return goal;
  }

  async deleteGoal(goalId: string, userId: string) {
    const goal = await SavingsGoal.findOne({ _id: goalId, userId });
    if (!goal) {
      throw new Error('RESOURCE_NOT_FOUND');
    }

    await SavingsGoal.findByIdAndDelete(goalId);
  }

  async addRule(goalId: string, userId: string, ruleData: AddRuleData) {
    const goal = await SavingsGoal.findOne({ _id: goalId, userId });
    if (!goal) {
      throw new Error('RESOURCE_NOT_FOUND');
    }

    if (goal.status !== 'active') {
      throw new Error('FORBIDDEN_ACTION');
    }

    goal.autoSaveRules.push({
      ...ruleData,
      isActive: true,
    });

    await goal.save();
    return goal;
  }

  async updateRule(goalId: string, userId: string, ruleIndex: number, ruleData: Partial<AddRuleData>) {
    const goal = await SavingsGoal.findOne({ _id: goalId, userId });
    if (!goal) {
      throw new Error('RESOURCE_NOT_FOUND');
    }

    if (!goal.autoSaveRules[ruleIndex]) {
      throw new Error('RESOURCE_NOT_FOUND');
    }

    Object.assign(goal.autoSaveRules[ruleIndex], ruleData);
    await goal.save();
    return goal;
  }

  async deleteRule(goalId: string, userId: string, ruleIndex: number) {
    const goal = await SavingsGoal.findOne({ _id: goalId, userId });
    if (!goal) {
      throw new Error('RESOURCE_NOT_FOUND');
    }

    if (!goal.autoSaveRules[ruleIndex]) {
      throw new Error('RESOURCE_NOT_FOUND');
    }

    goal.autoSaveRules.splice(ruleIndex, 1);
    await goal.save();
    return goal;
  }

  async contribute(goalId: string, userId: string, data: ContributeData) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const goal = await SavingsGoal.findOne({ _id: goalId, userId }).session(session);
      if (!goal) {
        throw new Error('RESOURCE_NOT_FOUND');
      }

      if (goal.status !== 'active') {
        throw new Error('FORBIDDEN_ACTION');
      }

      // Add contribution
      goal.contributions.push({
        amount: data.amount,
        date: new Date(),
        source: data.source || 'manual',
      });

      goal.currentAmount += data.amount;

      // Check if goal is completed
      if (goal.currentAmount >= goal.targetAmount) {
        goal.status = 'completed';
      }

      await goal.save({ session });

      // Create transaction record
      const savingsCategory = await mongoose.model('Category').findOne({ name: 'Savings', isDefault: true });
      if (savingsCategory) {
        await Transaction.create(
          [
            {
              userId,
              type: 'debit',
              amount: data.amount,
              category: savingsCategory._id,
              date: new Date(),
              description: `Contribution to ${goal.name}`,
              metadata: {
                source: 'auto-save',
                relatedId: goal._id,
              },
            },
          ],
          { session }
        );
      }

      await session.commitTransaction();
      return goal;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

export const savingsService = new SavingsService();
