/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// Justification: Supertest returns “body: any”. We will rely on the assertions below to validate behavior.

import { TaskResponseDTO } from '@src/domain/entities/Task';
import { TaskModel } from '@src/infra/database/mongoose/models/TaskModel';

describe('TaskController integration tests', () => {
  describe('DELETE /api/tasks/:id', () => {
    describe('(idempotent) when the task was deleted or not exist', () => {
      it('should return only status 204', async () => {
        const { body } = await global.testRequest
          .post('/api/tasks/')
          .send({
            title: 'testing',
            description: 'some text',
          })
          .expect(200);

        const typedBody = body as { data: TaskResponseDTO };
        const id = typedBody.data.id;

        await global.testRequest.delete(`/api/tasks/${id}`).expect(204);
        await global.testRequest.delete(`/api/tasks/${id}`).expect(204);
      });
    });
    describe("when the param 'id' is invalid", () => {
      describe('when the id not have 24 characters', () => {
        it("should return status 400 and message error 'ID must have exactly 24 characters'", async () => {
          const { body } = await global.testRequest
            .delete('/api/tasks/684984e34e832fe')
            .expect(400);

          expect(body.errors[0].context.issues[0].message).toBe(
            'ID must have exactly 24 characters',
          );
        });
      });
      describe('when the id not is hexadecimal', () => {
        it("should return status 400 and message error 'ID must be a valid hexadecimal'", async () => {
          const { body } = await global.testRequest
            .delete('/api/tasks/684982b09g65ba21ada57ze6')
            .expect(400);

          expect(body.errors[0].context.issues[0].message).toBe(
            'ID must be a valid hexadecimal',
          );
        });
      });
    });
    describe('when occurs any internal error in server', () => {
      it("should return status 500 and message 'Something went wrong'", async () => {
        jest.spyOn(TaskModel, 'deleteOne').mockImplementationOnce(() => {
          throw new Error('fail simulation database');
        });

        const { body } = await global.testRequest
          .delete('/api/tasks/684982b09f65ba21ada57fe6')
          .expect(500);

        expect(body.errors[0].message).toBe('Something went wrong');
      });
    });
  });
});
