import { toTaskResponseDTO } from '@src/application/mappers/TaskMapper';
import { Task, TaskResponseDTO } from '@src/domain/entities/Task';
import { Types } from 'mongoose';
import { ZodError } from 'zod';

const id = new Types.ObjectId().toHexString();
const date = new Date('2025-06-20T12:34:56.789Z');

const mockTask: Task = {
  id: id,
  title: 'test',
  description: 'testing',
  isDone: false,
  createdAt: date,
  updatedAt: date,
};
const { createdAt, updatedAt, ...rest } = mockTask;
const mockTaskResponse: TaskResponseDTO = {
  ...rest,
  createdAt: createdAt.toISOString(),
  updatedAt: updatedAt.toISOString(),
};

describe('function TaskMapper', () => {
  it('should convert Task to TaskResponse and return valid taskReponseDTO', () => {
    const result = toTaskResponseDTO(mockTask);

    expect(result).toStrictEqual(mockTaskResponse);
  });
  it('should throw ZodError if an invalid Task was provided', () => {
    const { id: _, ...rest } = mockTask;
    const newMockTask = {
      id: 'testingId',
      ...rest,
    };

    expect(() => {
      toTaskResponseDTO(newMockTask);
    }).toThrow(ZodError);
  });
});
