import 'reflect-metadata';
import { SetupServer } from '@src/server';
import { MongoTestContainer } from '@test/utils/MongoTestContainer';
import supertest from 'supertest';

const SIXTY_SECONDS = 60 * 1000;

let container: MongoTestContainer;

beforeAll(async () => {
  container = MongoTestContainer.getInstance();
  await container.connect();

  const server = new SetupServer();
  server.init();
  global.testRequest = supertest(server.getApp());
}, SIXTY_SECONDS);

afterAll(async () => {
  await container.closeDatabase();
});

beforeEach(async () => {
  await container.clearDatabase();
});
