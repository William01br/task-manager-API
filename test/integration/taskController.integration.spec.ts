/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// Justification: Supertest returns “body: any”. We will rely on the assertions below to validate behavior.

import { TaskResponseDTO } from '@src/domain/entities/Task';
import { TaskModel } from '@src/infra/database/mongoose/models/TaskModel';

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
  describe('GET /api/tasks/', () => {
    describe('when the task is return successfully', () => {
      // it('should return status 200 and an valid paginate taskResponseDTO', async () => {
      //   const response = await global.testRequest.get('/api/tasks/1/10');
      //   console.log(response.body);
      //   expect(response.status).toBe(200);
      // });
    });
  });
});
