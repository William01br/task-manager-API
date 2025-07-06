import { Redis } from 'ioredis';
import { ICacheService } from './ICacheService';
import { inject, injectable } from 'tsyringe';

/**
 * The cache strategy is Cache-Aside
 */

@injectable()
export class CacheService implements ICacheService {
  constructor(
    @inject('Redis')
    private readonly client: Redis,
  ) {}

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set<T>(key: string, value: T, ttlSeconds = 60): Promise<void> {
    await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }
}
