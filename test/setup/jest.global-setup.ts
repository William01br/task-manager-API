import { MongoDBContainer } from '@testcontainers/mongodb';
import { RedisContainer } from '@testcontainers/redis';
import { writeFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Global types were declared to allow sharing values between jest.setup-global and jest.teardown—since they run in separate processes (workers).
  1. We declared the global variables in globals.d.ts (performing a declaration merge on NodeJS.Global).
  2. In the setup file, we assigned global.testContainerX to the instance returned by new MongoDBContainer().start() (and similarly for Redis).
  3. In the teardown file, we called await global.testContainerX.stop() to shut down each container.

  why this? 
  Jest spawns separate worker processes for each test file, so you can’t share variables across files by default.
 */

export default async function setSetupGlobal() {
  global.testContainerMongo = await new MongoDBContainer(
    'mongo:8.0-noble',
  ).start();
  const mongoUrl = `TEST_CONFIG_MONGODB_URL=${global.testContainerMongo.getConnectionString()}`;

  global.testContainerRedis = await new RedisContainer(
    'redis:8-alpine3.21',
  ).start();
  const redisUrl = `TEST_CONFIG_REDIS_URL=${global.testContainerRedis.getConnectionUrl()}`;

  setEnvs(mongoUrl, redisUrl);
}

function setEnvs(...urls: string[]) {
  const envTestPath = path.resolve(__dirname, '../../.env.test');
  const newUrls = urls.join(', ').replace(', ', '\n');
  console.log(newUrls);
  writeFileSync(envTestPath, newUrls, { encoding: 'utf-8' });
}
