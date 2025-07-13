/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// Justification: Supertest returns “body: any”. We will rely on the assertions below to validate behavior.

import { redis } from '@src/config/cache';
import { TaskResponseDTO } from '@src/domain/entities/Task';

describe('TaskController integration tests', () => {
  describe('CACHE-ASSIDE feature', () => {
    describe('when occurs cache invalidation', () => {
      it('POST - should call "smembers" of Redis', async () => {
        const spySmembers = jest.spyOn(redis, 'smembers');

        await global.testRequest
          .post('/api/tasks/')
          .send({
            title: 'test',
            description: 'some text',
          })
          .expect(200);

        expect(spySmembers).toHaveBeenCalledTimes(1);
      });
      it('DELETE - should call "smembers" of Redis', async () => {
        const { body } = await global.testRequest
          .post('/api/tasks/')
          .send({
            title: 'test',
            description: 'some text',
          })
          .expect(200);

        const typedBody = body as { data: TaskResponseDTO };
        const id = typedBody.data.id;

        await global.testRequest.delete(`/api/tasks/${id}`).expect(204);

        const spySmembers = jest.spyOn(redis, 'smembers');
        expect(spySmembers).toHaveBeenCalledTimes(2);
      });
      it('PATCH - should call "smembers" of Redis', async () => {
        const spySmembers = jest.spyOn(redis, 'smembers');

        const { body } = await global.testRequest
          .post('/api/tasks/')
          .send({
            title: 'test',
            description: 'some text',
          })
          .expect(200);

        const typedBody = body as { data: TaskResponseDTO };
        const id = typedBody.data.id;

        await global.testRequest
          .patch(`/api/tasks/${id}`)
          .send({
            isDone: true,
          })
          .expect(200);

        expect(spySmembers).toHaveBeenCalledTimes(2);
      });
    });
    describe('when occurs CACHE MISS', () => {
      it('GET (getById-TaskService) -> should call "set" of Redis', async () => {
        const spySet = jest.spyOn(redis, 'set');

        const { body } = await global.testRequest
          .post('/api/tasks/')
          .send({
            title: 'test',
            description: 'some text',
          })
          .expect(200);

        const typedBody = body as { data: TaskResponseDTO };
        const id = typedBody.data.id;

        await global.testRequest.get(`/api/tasks/${id}`).expect(200);

        expect(spySet).toHaveBeenCalled();
      });
      it('GET (getAll-TaskService) -> should call "multi" of Redis and execute pipeline', async () => {
        const spyMulti = jest.spyOn(redis, 'multi');

        await global.testRequest
          .post('/api/tasks/')
          .send({
            title: 'test',
            description: 'some text',
          })
          .expect(200);

        await global.testRequest.get(`/api/tasks/1/10`).expect(200);

        expect(spyMulti).toHaveBeenCalled();
      });
    });
    describe('when occurs CACHE HIT', () => {
      it('GET (getById-TaskService) -> should call "get" of Redis', async () => {
        const spyGet = jest.spyOn(redis, 'get');
        const spySet = jest.spyOn(redis, 'set');

        const { body } = await global.testRequest
          .post('/api/tasks/')
          .send({
            title: 'test',
            description: 'some text',
          })
          .expect(200);

        const typedBody = body as { data: TaskResponseDTO };
        const id = typedBody.data.id;

        await global.testRequest.get(`/api/tasks/${id}`).expect(200);
        await global.testRequest.get(`/api/tasks/${id}`).expect(200);

        expect(spyGet).toHaveBeenCalledTimes(2);
        expect(spySet).toHaveBeenCalledTimes(1);
      });
      it('GET (getAll-TaskService) -> should call "get" of Redis', async () => {
        const spyGet = jest.spyOn(redis, 'get');
        const spyMulti = jest.spyOn(redis, 'multi');

        await global.testRequest
          .post('/api/tasks/')
          .send({
            title: 'test',
            description: 'some text',
          })
          .expect(200);

        await global.testRequest.get(`/api/tasks/1/10`).expect(200);
        await global.testRequest.get(`/api/tasks/1/10`).expect(200);

        expect(spyGet).toHaveBeenCalledTimes(2);
        expect(spyMulti).toHaveBeenCalledTimes(1);
      });
    });
  });
});
