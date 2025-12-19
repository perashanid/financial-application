import { createClient } from 'redis';
import { logger } from '../utils/logger';

let redisClient: any = null;
let isRedisEnabled = false;

// Check if Redis should be enabled
const REDIS_ENABLED = process.env.REDIS_ENABLED !== 'false';

if (REDIS_ENABLED) {
  redisClient = createClient({
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
    password: process.env.REDIS_PASSWORD || undefined,
  });

  redisClient.on('error', (error: any) => {
    logger.error('Redis error:', error);
  });

  redisClient.on('connect', () => {
    logger.info('Redis connected successfully');
    isRedisEnabled = true;
  });
}

export const connectRedis = async (): Promise<void> => {
  if (!REDIS_ENABLED) {
    logger.info('Redis is disabled');
    return;
  }
  
  try {
    await redisClient.connect();
  } catch (error) {
    logger.error('Redis connection error:', error);
  }
};

// Safe Redis wrapper that handles when Redis is disabled
export const safeRedis = {
  async get(key: string): Promise<string | null> {
    if (!isRedisEnabled || !redisClient) return null;
    try {
      return await redisClient.get(key);
    } catch (error) {
      logger.warn('Redis get error:', error);
      return null;
    }
  },
  
  async setEx(key: string, seconds: number, value: string): Promise<void> {
    if (!isRedisEnabled || !redisClient) return;
    try {
      await redisClient.setEx(key, seconds, value);
    } catch (error) {
      logger.warn('Redis setEx error:', error);
    }
  },
  
  async del(key: string): Promise<void> {
    if (!isRedisEnabled || !redisClient) return;
    try {
      await redisClient.del(key);
    } catch (error) {
      logger.warn('Redis del error:', error);
    }
  }
};

export { redisClient };
