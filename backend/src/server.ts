import app from './app';
import { config } from './config/env';
import { connectDatabase } from './config/database';
// import { connectRedis } from './config/redis';
import { logger } from './utils/logger';
import { categoryService } from './services/categoryService';
import { setupSavingsJobs } from './jobs/savingsJobs';
import { setupLoanJobs } from './jobs/loanJobs';

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Connect to Redis (disabled for now)
    // await connectRedis();

    // Seed default categories
    await categoryService.seedDefaultCategories();
    logger.info('Default categories seeded');

    // Setup cron jobs
    setupSavingsJobs();
    setupLoanJobs();

    // Start Express server
    const server = app.listen(config.PORT, () => {
      logger.info(`Server running on port ${config.PORT} in ${config.NODE_ENV} mode`);
      logger.info(`Health check available at http://localhost:${config.PORT}/health`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        try {
          // Close database connections
          await Promise.all([
            // mongoose.connection.close() is handled automatically
            // redisClient.quit() if needed
          ]);
          
          logger.info('Database connections closed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
