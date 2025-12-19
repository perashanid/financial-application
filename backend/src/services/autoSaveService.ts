import { SavingsGoal } from '../models/SavingsGoal';
import { Transaction } from '../models/Transaction';
import { savingsService } from './savingsService';
import { logger } from '../utils/logger';

export class AutoSaveService {
  async processPercentageRule(userId: string, transactionId: string) {
    try {
      const transaction = await Transaction.findOne({ _id: transactionId, userId });
      if (!transaction || transaction.type !== 'credit') {
        return;
      }

      const goals = await SavingsGoal.find({
        userId,
        status: 'active',
        'autoSaveRules.type': 'percentage',
        'autoSaveRules.isActive': true,
      });

      for (const goal of goals) {
        const percentageRules = goal.autoSaveRules.filter(
          (rule) => rule.type === 'percentage' && rule.isActive
        );

        for (const rule of percentageRules) {
          const saveAmount = (transaction.amount * rule.value) / 100;
          if (saveAmount > 0) {
            await savingsService.contribute(String(goal._id), userId, {
              amount: saveAmount,
              source: 'auto-percentage',
            });
            logger.info(`Auto-saved ${saveAmount} to goal ${goal.name} (${rule.value}% of ${transaction.amount})`);
          }
        }
      }
    } catch (error) {
      logger.error('Error processing percentage rule:', error);
      throw error;
    }
  }

  async processRoundUpRule(userId: string, transactionId: string) {
    try {
      const transaction = await Transaction.findOne({ _id: transactionId, userId });
      if (!transaction || transaction.type !== 'debit') {
        return;
      }

      const goals = await SavingsGoal.find({
        userId,
        status: 'active',
        'autoSaveRules.type': 'roundup',
        'autoSaveRules.isActive': true,
      });

      for (const goal of goals) {
        const roundUpRules = goal.autoSaveRules.filter(
          (rule) => rule.type === 'roundup' && rule.isActive
        );

        for (const rule of roundUpRules) {
          const roundUpTo = rule.value;
          const remainder = transaction.amount % roundUpTo;
          const saveAmount = remainder > 0 ? roundUpTo - remainder : 0;

          if (saveAmount > 0) {
            await savingsService.contribute(String(goal._id), userId, {
              amount: saveAmount,
              source: 'auto-roundup',
            });
            logger.info(`Round-up saved ${saveAmount} to goal ${goal.name} (rounded to ${roundUpTo})`);
          }
        }
      }
    } catch (error) {
      logger.error('Error processing round-up rule:', error);
      throw error;
    }
  }

  async processScheduledRules() {
    try {
      const goals = await SavingsGoal.find({
        status: 'active',
        'autoSaveRules.type': 'scheduled',
        'autoSaveRules.isActive': true,
      });

      for (const goal of goals) {
        const scheduledRules = goal.autoSaveRules.filter(
          (rule) => rule.type === 'scheduled' && rule.isActive
        );

        for (const rule of scheduledRules) {
          const saveAmount = rule.value;
          if (saveAmount > 0) {
            await savingsService.contribute(String(goal._id), String(goal.userId), {
              amount: saveAmount,
              source: 'auto-scheduled',
            });
            logger.info(`Scheduled save ${saveAmount} to goal ${goal.name}`);
          }
        }
      }
    } catch (error) {
      logger.error('Error processing scheduled rules:', error);
      throw error;
    }
  }

  async executeAutoSaveRules(userId: string, transactionId: string) {
    try {
      await this.processPercentageRule(userId, transactionId);
      await this.processRoundUpRule(userId, transactionId);
    } catch (error) {
      logger.error('Error executing auto-save rules:', error);
    }
  }
}

export const autoSaveService = new AutoSaveService();
