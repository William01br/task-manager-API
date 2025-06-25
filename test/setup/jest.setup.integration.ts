import 'reflect-metadata';
import { SetupServer } from '@src/server';
import { MongoTestContainer } from '@test/utils/MongoTestContainer';
import supertest from 'supertest';

let container: MongoTestContainer;

beforeAll(async () => {
  container = MongoTestContainer.getInstance();
  await container.connect();

  const server = new SetupServer();
  server.init();
  global.testRequest = supertest(server.getApp());
}, 30000);

afterAll(async () => {
  await container.closeDatabase();
});

beforeEach(async () => {
  await container.clearDatabase();
});
