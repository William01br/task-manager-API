import { MongoDBContainer } from '@testcontainers/mongodb';
import { RedisContainer } from '@testcontainers/redis';

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

  global.testContainerRedis = await new RedisContainer(
    'redis:8-alpine3.21',
  ).start();
}
