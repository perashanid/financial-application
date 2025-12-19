import cron from 'node-cron';
import { loanService } from '../services/loanService';
import { Loan } from '../models/Loan';
import { logger } from '../utils/logger';

export const setupLoanJobs = () => {
  // Check for overdue loans daily at 01:00
  cron.schedule('0 1 * * *', async () => {
    logger.info('Running overdue loan check job...');
    try {
      const count = await loanService.checkOverdueLoans();
      logger.info(`Overdue loan check completed. ${count} loans marked as overdue`);
    } catch (error) {
      logger.error('Overdue loan check job failed:', error);
    }
  });

  // Send EMI reminders daily at 09:00
  cron.schedule('0 9 * * *', async () => {
    logger.info('Running EMI reminder job...');
    try {
      const now = new Date();
      const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      // Find loans with due dates in the next 3 days
      const upcomingLoans = await Loan.find({
        status: 'active',
        dueDate: { $gte: now, $lte: threeDaysFromNow },
      }).populate('userId');

      logger.info(`Found ${upcomingLoans.length} loans with upcoming due dates`);
      
      // TODO: Send notifications to users
      // This would integrate with the notification service when implemented
      
    } catch (error) {
      logger.error('EMI reminder job failed:', error);
    }
  });

  logger.info('Loan cron jobs initialized');
};
