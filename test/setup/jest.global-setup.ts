import path from 'node:path';
import { writeFileSync } from 'node:fs';

import { config as loadEnv } from 'dotenv';
import { MongoDBContainer } from '@testcontainers/mongodb';
import { RedisContainer } from '@testcontainers/redis';

loadEnv({
  path: path.resolve(__dirname, '../../.env.test.local'),
  override: true,
});

/**
 * In Jest's global setup, we automatically start the MongoDB and Redis containers
 * using Testcontainers - they already come with `autoremove: true`, so there's no need to invoke `.stop()` on teardown.
 *
 * The generated connection URLs are written to `.env.test.local`, which is read from `jest.setup.integration.ts` to configure Mongoose and Redis.
 */

export default async function setSetupGlobal() {
  const mongoContainer = await new MongoDBContainer('mongo:8.0-noble').start();
  const redisContainer = await new RedisContainer('redis:8-alpine3.21').start();

  const envMongoUrl = `TEST_MONGODB_URL=${mongoContainer.getConnectionString()}`;
  const envRedisUrl = `TEST_REDIS_URL=${redisContainer.getConnectionUrl()}`;
  setUrls(`NODE_ENV=test`, envMongoUrl, envRedisUrl);
}

function setUrls(...urls: string[]): void {
  const formatedUrls = urls.join(', ').replace(/, /g, '\n');
  console.log(formatedUrls);
  const pathEnv = path.resolve(__dirname, '..', '..', '.env.test.local');
  writeFileSync(pathEnv, formatedUrls);
}
