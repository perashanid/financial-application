import cron from 'node-cron';
import { autoSaveService } from '../services/autoSaveService';
import { logger } from '../utils/logger';

export const setupSavingsJobs = () => {
  // Run scheduled savings daily at 00:00 (midnight)
  cron.schedule('0 0 * * *', async () => {
    logger.info('Running scheduled savings job...');
    try {
      await autoSaveService.processScheduledRules();
      logger.info('Scheduled savings job completed successfully');
    } catch (error) {
      logger.error('Scheduled savings job failed:', error);
    }
  });

  logger.info('Savings cron jobs initialized');
};
