/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// Justification: Supertest returns “body: any”. We will rely on the assertions below to validate behavior.

import { TaskResponseDTO } from '@src/domain/entities/Task';
import { TaskModel } from '@src/infra/database/mongoose/models/TaskModel';

describe('PATCH /api/tasks/:id', () => {
  describe('when the paylod is send correctly', () => {
    it('should return status 200 and the task updated', async () => {
      const request = await global.testRequest
        .post('/api/tasks')
        .send({ title: 'testing', description: 'some text' })
        .expect(200);

      const typedPostBody = request.body as { data: TaskResponseDTO };

      const id = typedPostBody.data.id;

      expect(typedPostBody.data.isDone).toBe(false);

      const { body } = await global.testRequest
        .patch(`/api/tasks/${id}`)
        .send({
          title: 'testing patch',
          isDone: true,
        })
        .expect(200);

      const typedBody = body as { data: TaskResponseDTO };

      expect(typedBody.data.title).toBe('testing patch');
      expect(typedBody.data.isDone).toBe(true);
      expect(typedBody.data.id).toBe(id);
    });
  });
  describe('when the paylod is send with extra fields', () => {
    it('should return status 200 and the task updated', async () => {
      const request = await global.testRequest
        .post('/api/tasks')
        .send({ title: 'testing', description: 'some text' })
        .expect(200);

      const typedPostBody = request.body as { data: TaskResponseDTO };

      const id = typedPostBody.data.id;

      expect(typedPostBody.data.isDone).toBe(false);

      const { body } = await global.testRequest
        .patch(`/api/tasks/${id}`)
        .send({
          title: 'testing patch two',
          isDone: true,
          completed: false,
        })
        .expect(200);

      const typedBody = body as { data: TaskResponseDTO };

      expect(typedBody.data).not.toHaveProperty('completed');
      expect(typedBody.data.title).toBe('testing patch two');
      expect(typedBody.data.isDone).toBe(true);
      expect(typedBody.data.id).toBe(id);
    });
  });
});
describe("when the param 'id' is invalid", () => {
  describe('when the id not have 24 characters', () => {
    it("should return status 400 and message error 'ID must have exactly 24 characters'", async () => {
      const { body } = await global.testRequest
        .patch('/api/tasks/684984e34e832fe')
        .expect(400);

      expect(body.errors[0].context.issues[0].message).toBe(
        'ID must have exactly 24 characters',
      );
    });
  });
  describe('when the id not is hexadecimal', () => {
    it("should return status 400 and message error 'ID must be a valid hexadecimal'", async () => {
      const { body } = await global.testRequest
        .patch('/api/tasks/684982b09g65ba21ada57ze6')
        .expect(400);

      expect(body.errors[0].context.issues[0].message).toBe(
        'ID must be a valid hexadecimal',
      );
    });
  });
});
describe('when the body send is null', () => {
  it("should return status 400 and message 'At least one field must be provided for update'", async () => {
    const request = await global.testRequest
      .post('/api/tasks')
      .send({ title: 'testing', description: 'some text' })
      .expect(200);

    const typedPostBody = request.body as { data: TaskResponseDTO };
    const id = typedPostBody.data.id;

    const { body } = await global.testRequest
      .patch(`/api/tasks/${id}`)
      .send({})
      .expect(400);

    expect(body.errors[0].context.issues[0].message).toBe(
      'At least one field must be provided for update',
    );
  });
});
describe('when the task not exist', () => {
  it("should return status 404 and message 'Task not found'", async () => {
    const { body } = await global.testRequest
      .patch('/api/tasks/684982b09f65ba21ada57fe6')
      .send({
        isDone: true,
      })
      .expect(404);

    expect(body.errors[0].message).toBe('Task not found');
  });
});
describe('when occurs any internal error in server', () => {
  it("should return status 500 and message 'Something went wrong'", async () => {
    jest.spyOn(TaskModel, 'findByIdAndUpdate').mockImplementationOnce(() => {
      throw new Error('fail simulation database');
    });

    const { body } = await global.testRequest
      .patch('/api/tasks/684982b09f65ba21ada57fe6')
      .send({
        isDone: true,
      })
      .expect(500);

    expect(body.errors[0].message).toBe('Something went wrong');
  });
});
