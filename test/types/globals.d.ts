import { StartedMongoDBContainer } from '@testcontainers/mongodb';
import { StartedRedisContainer } from '@testcontainers/redis';

/* eslint-disable no-var*/
export {};

declare global {
  var testRequest: import('supertest/lib/agent');
  var testContainerMongo: StartedMongoDBContainer;
  var testContainerRedis: StartedRedisContainer;
}
