import 'reflect-metadata';

import mongoose from 'mongoose';
import Redis from 'ioredis';
import request from 'supertest';
import { SetupServer } from '@src/server';

let redis: Redis;

beforeAll(async () => {
  const server = new SetupServer();
  server.init();

  global.testRequest = request(server.getApp());

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const id = process.env.JEST_WORKER_ID!;
  console.log(id);
  const dbName = `testdb_${id}`;
  await mongoose.connect(`${String(process.env.TEST_MONGODB_URL)}/${dbName}`, {
    directConnection: true,
  });

  redis = new Redis(String(process.env.TEST_REDIS_URL));
}, 10000);

afterAll(async () => {
  await redis.quit();
  await mongoose.connection.close();
});

beforeEach(async () => {
  await redis.flushdb();
  await mongoose.connection.db?.dropDatabase();
});
