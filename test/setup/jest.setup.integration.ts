import 'reflect-metadata';
import http from 'node:http';
import supertest from 'supertest';
import mongoose from 'mongoose';
import Redis from 'ioredis';

import { SetupServer } from '@src/server';

const SIXTY_SECONDS = 60 * 1000;

let redis: Redis;
let mongo: mongoose.Connection;
let server: SetupServer;

beforeAll(async () => {
  try {
    await mongoose.connect(global.testContainerMongo.getConnectionString(), {
      directConnection: true,
    });
    mongo = mongoose.connection;

    redis = new Redis(global.testContainerRedis.getConnectionUrl());

    server = new SetupServer();
    server.init();
    global.testRequest = supertest(server.getApp());
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}, SIXTY_SECONDS);

afterAll(async () => {
  redis.disconnect();
  await mongo.destroy();
  http.globalAgent.destroy();
});

beforeEach(async () => {
  await redis.flushdb();
  await clearMongo();
});

async function clearMongo(): Promise<void> {
  const collections = Object.values(mongo.collections);
  for (const coll of collections) {
    await coll.deleteMany({});
  }
}
