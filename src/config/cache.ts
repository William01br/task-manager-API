import { Redis } from 'ioredis';
import env from './env';
import logger from '../logging/logger';

export const redis: Redis = new Redis(env.ME_CONFIG_REDIS_URL, {
  lazyConnect: true,
});
redis.on('error', (err) => logger.error('Redis Client Error:', err));

/**
 * Cache Eviction Policies:
 * Policy LRU of Redis Server
 */
export const connectToRedis = async (): Promise<void> => {
  await redis.connect();
  await redis.config('SET', 'maxmemory', '512mb');
  await redis.config('SET', 'maxmemory-policy', 'allkeys-lru');
};
