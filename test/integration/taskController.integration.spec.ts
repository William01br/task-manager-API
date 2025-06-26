/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// Justification: Supertest returns “body: any”. We will rely on the assertions below to validate behavior.

import { TaskResponseDTO } from '@src/domain/entities/Task';
import { TaskModel } from '@src/infra/database/mongoose/models/TaskModel';
import { PaginateResult } from 'mongoose';

describe('TaskController integration tests', () => {
  describe('POST /api/tasks', () => {
    describe('when the task is created with successfully', () => {
      it('should return status 200 and body with the task', async () => {
        const { body } = await global.testRequest
          .post('/api/tasks')
          .send({
            title: 'testing',
            description: 'someone word',
          })
          .expect(200);

        const typedBody = body as { data: TaskResponseDTO };
        expect(typeof typedBody.data.id).toBe('string');
        expect(typedBody.data.title).toBe('testing');
        expect(typedBody.data.description).toBe('someone word');
        expect(typedBody.data.isDone).toBe(false);
        expect(typedBody.data).toHaveProperty('createdAt');
      });
      it('should return status 200 and body with task regardless if send extra fields in payload', async () => {
        const { body } = await global.testRequest
          .post('/api/tasks')
          .send({
            title: 'testing',
            description: 'someone word',
            completed: false,
          })
          .expect(200);

        const typedBody = body as { data: TaskResponseDTO };
        expect(typeof typedBody.data.id).toBe('string');
        expect(typedBody.data.isDone).toBe(false);
        expect(typedBody.data).not.toHaveProperty('completed');
      });
    });
    describe('when is send invalid filds', () => {
      it('should return status 400 and error message', async () => {
        const { body } = await global.testRequest
          .post('/api/tasks')
          .send({
            title: '',
            description: 'some text',
          })
          .expect(400);

        expect(body.errors[0]).toHaveProperty('message');
      });
    });
    describe('when occurs any internal error in server', () => {
      it("should return status 500 and message 'Something went wrong'", async () => {
        jest
          .spyOn(TaskModel, 'create')
          .mockRejectedValueOnce(new Error('fail simulation database'));

        const { body } = await global.testRequest
          .post('/api/tasks')
          .send({
            title: 'test',
            description: 'some text',
          })
          .expect(500);

        expect(body.errors[0].message).toBe('Something went wrong');
      });
    });
  });
  describe('GET /api/tasks/:page/:limit', () => {
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

        console.log(body);
        const typedBody = body as { data: PaginateResult<TaskResponseDTO> };

        expect(typedBody.data.page).toBe(1);
        expect(typedBody.data.limit).toBe(10);
        expect(typedBody.data.totalDocs).toBe(1);
        expect(typedBody.data.docs[0].title).toBe('test');
        expect(typeof typedBody.data.docs[0].id).toBe('string');
      });
    });
    describe('when the params are invalids', () => {
      describe("when the param 'page' haven't tasks", () => {
        it("should return status 404 e error message 'Page not found'", async () => {
          const { body } = await global.testRequest
            .get('/api/tasks/1/10')
            .expect(404);

          expect(body.errors[0].message).toBe('Page not found');
        });
      });
      describe("when the param 'page' is smaller than 0", () => {
        it("should return status 400 and message 'The page must be greater than 0'", async () => {
          const { body } = await global.testRequest
            .get('/api/tasks/0/10')
            .expect(400);

          expect(body.errors[0].context.issues[0].message).toBe(
            'The page must be greater than 0',
          );
        });
      });
      describe("when the param 'page' is NaN", () => {
        it("should return status 400 and message 'The page must be a valid number'", async () => {
          const { body } = await global.testRequest
            .get('/api/tasks/1j/10')
            .expect(400);

          expect(body.errors[0].context.issues[0].message).toBe(
            'The page must be a valid number',
          );
        });
      });
      describe("when the param 'limit' is greater than 100", () => {
        it("should return status 400 and message 'The limit should be greater than 0 and not exceed 100'", async () => {
          const { body } = await global.testRequest
            .get('/api/tasks/1/101')
            .expect(400);

          expect(body.errors[0].context.issues[0].message).toBe(
            'The limit should be greater than 0 and not exceed 100',
          );
        });
      });
      describe("when the param 'limit' is smaller than 100", () => {
        it("should return status 400 and message 'The limit should be greater than 0 and not exceed 100'", async () => {
          const { body } = await global.testRequest
            .get('/api/tasks/1/0')
            .expect(400);

          expect(body.errors[0].context.issues[0].message).toBe(
            'The limit should be greater than 0 and not exceed 100',
          );
        });
      });
      describe("when the param 'limit' is NaN", () => {
        it("should return status 400 and message 'The page must be a valid number'", async () => {
          const { body } = await global.testRequest
            .get('/api/tasks/1/10O')
            .expect(400);

          expect(body.errors[0].context.issues[0].message).toBe(
            'The limit must be a valid number',
          );
        });
      });
    });
    describe('when the page provided by client not have tasks', () => {
      it("should return status 404 and message 'Page not found'", async () => {
        const { body } = await global.testRequest
          .get('/api/tasks/1/10')
          .expect(404);

        expect(body.errors[0].message).toBe('Page not found');
      });
    });
    describe('when occurs any internal error in server', () => {
      it("should return status 500 and message 'Something went wrong'", async () => {
        jest
          .spyOn(TaskModel, 'paginate')
          .mockRejectedValueOnce(new Error('fail simulation database'));

        const { body } = await global.testRequest
          .get('/api/tasks/1/10')
          .expect(500);

        expect(body.errors[0].message).toBe('Something went wrong');
      });
    });
  });
  describe('GET /api/tasks/:id', () => {
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
    describe("when the param 'id' is invalid", () => {
      describe('when the id not have 24 characters', () => {
        it("should return status 400 and message error 'ID must have exactly 24 characters'", async () => {
          const { body } = await global.testRequest
            .get('/api/tasks/684984e34e832fe')
            .expect(400);

          expect(body.errors[0].context.issues[0].message).toBe(
            'ID must have exactly 24 characters',
          );
        });
      });
      describe('when the id not is hexadecimal', () => {
        it("should return status 400 and message error 'ID must be a valid hexadecimal'", async () => {
          const { body } = await global.testRequest
            .get('/api/tasks/684982b09g65ba21ada57ze6')
            .expect(400);

          expect(body.errors[0].context.issues[0].message).toBe(
            'ID must be a valid hexadecimal',
          );
        });
      });
    });
    describe('when the task not exist', () => {
      it("should return status 404 and message 'Task not found'", async () => {
        const { body } = await global.testRequest
          .get('/api/tasks/684984e34e832fe4542c0e0a')
          .expect(404);

        expect(body.errors[0].message).toBe('Task not found');
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
});
