/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */

// Justification: Supertest returns “body: any”. We will rely on the assertions below to validate behavior.

import { TaskResponseDTO } from '@src/domain/entities/Task';
import { TaskModel } from '@src/infra/database/mongoose/models/TaskModel';
import { SetupServer } from '@src/server';
import { PaginateResult } from 'mongoose';

/**
 * Table Driven Testing
 */
describe('GET /api/tasks/:page/:limit', () => {
  const setupServer = new SetupServer();
  setupServer.init();
  const cases = [
    {
      desc: "when the param 'page' haven't tasks",
      route: '/api/tasks/1/8',
      expectedStatus: 404,
      expectedMessage: 'Page not found',
      extract: (body: any) => body.errors[0].message,
    },
    {
      desc: "when the param 'page' is smaller than 0",
      route: '/api/tasks/0/10',
      expectedStatus: 400,
      expectedMessage: 'The page must be greater than 0',
      extract: (body: any) => body.errors[0].context.issues[0].message,
    },
    {
      desc: "when the param 'page' is NaN",
      route: '/api/tasks/1j/10',
      expectedStatus: 400,
      expectedMessage: 'The page must be a valid number',
      extract: (body: any) => body.errors[0].context.issues[0].message,
    },
    {
      desc: "when the param 'limit' is smaller than 100",
      route: '/api/tasks/1/101',
      expectedStatus: 400,
      expectedMessage: 'The limit should be greater than 0 and not exceed 100',
      extract: (body: any) => body.errors[0].context.issues[0].message,
    },
    {
      desc: "when the param 'limit' is NaN",
      route: '/api/tasks/1/10O',
      expectedStatus: 400,
      expectedMessage: 'The limit must be a valid number',
      extract: (body: any) => body.errors[0].context.issues[0].message,
    },
    {
      desc: "when the param 'limit' is NaN",
      route: '/api/tasks/1/10O',
      expectedStatus: 400,
      expectedMessage: 'The limit must be a valid number',
      extract: (body: any) => body.errors[0].context.issues[0].message,
    },
    {
      desc: 'when the page provided by client not have tasks',
      route: '/api/tasks/1/9',
      expectedStatus: 404,
      expectedMessage: 'Page not found',
      extract: (body: any) => body.errors[0].message,
    },
  ];

  test.each(cases)(
    `should return $expectedStatus and error message $desc`,
    async ({ route, expectedStatus, expectedMessage, extract }) => {
      const { body } = await global.testRequest
        .get(route)
        .expect(expectedStatus);
      expect(extract(body)).toBe(expectedMessage);
    },
  );
  describe('when occurs any internal error in server', () => {
    it("should return status 500 and message 'Something went wrong'", async () => {
      jest
        .spyOn(TaskModel, 'paginate')
        .mockRejectedValueOnce(new Error('fail simulation database'));
      const { body } = await global.testRequest
        .get('/api/tasks/1/7')
        .expect(500);
      expect(body.errors[0].message).toBe('Something went wrong');
    });
  });
  describe('when the tasks is return successfully', () => {
    it('should return status 200 and an valid paginate response', async () => {
      await TaskModel.create({
        title: 'test',
        description: 'some text',
        isDone: false,
      });
      const { body } = await global.testRequest
        .get('/api/tasks/1/10')
        .expect(200);

      const typedBody = body as { data: PaginateResult<TaskResponseDTO> };

      expect(typedBody.data.page).toBe(1);
      expect(typedBody.data.limit).toBe(10);
      expect(typedBody.data.totalDocs).toBe(1);
      expect(typedBody.data.docs[0].title).toBe('test');
      expect(typeof typedBody.data.docs[0].id).toBe('string');
    });
  });
});
describe('GET /api/tasks/:id', () => {
  const cases = [
    {
      desc: 'when the id not have 24 characters',
      route: '/api/tasks/684984e34e832fe',
      expectedStatus: 400,
      expectedMessage: 'ID must have exactly 24 characters',
      extract: (body: any) => body.errors[0].context.issues[0].message,
    },
    {
      desc: 'when the id not is hexadecimal',
      route: '/api/tasks/684982b09g65ba21ada57ze6',
      expectedStatus: 400,
      expectedMessage: 'ID must be a valid hexadecimal',
      extract: (body: any) => body.errors[0].context.issues[0].message,
    },
    {
      desc: 'when the task not exist',
      route: '/api/tasks/684984e34e832fe4542c0e0a',
      expectedStatus: 404,
      expectedMessage: 'Task not found',
      extract: (body: any) => body.errors[0].message,
    },
  ];

  test.each(cases)(
    `should return $expectedStatus and error message $desc`,
    async ({ route, expectedStatus, expectedMessage, extract }) => {
      const { body } = await global.testRequest
        .get(route)
        .expect(expectedStatus);
      expect(extract(body)).toBe(expectedMessage);
    },
  );
  describe('when the id is valid and the task exist', () => {
    it('should return status 200 and the task', async () => {
      const request = await global.testRequest
        .post('/api/tasks')
        .send({
          title: 'testing',
          description: 'some text',
        })
        .expect(200);
      const typedPostBody = request.body as { data: TaskResponseDTO };
      const id = typedPostBody.data.id;

      const { body } = await global.testRequest
        .get(`/api/tasks/${id}`)
        .expect(200);

      const typedGetBody = body as { data: TaskResponseDTO };

      expect(typedGetBody.data.id).toBe(id);
      expect(typedGetBody.data.title).toBe('testing');
    });
  });
  describe('when occurs any internal error in server', () => {
    it("should return status 500 and message 'Something went wrong'", async () => {
      jest.spyOn(TaskModel, 'findById').mockImplementationOnce(() => {
        throw new Error('fail simulation database');
      });
      const { body } = await global.testRequest
        .get('/api/tasks/684984e34e832fe4542c0e0a')
        .expect(500);
      expect(body.errors[0].message).toBe('Something went wrong');
    });
  });
});
