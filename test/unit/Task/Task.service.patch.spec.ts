jest.mock('@src/application/mappers/TaskMapper', () => ({
  toTaskResponseDTO: jest.fn(),
}));
jest.mock('ioredis');

import { toTaskResponseDTO } from '@src/application/mappers/TaskMapper';
import { TaskService } from '@src/application/services/TaskService';
import { NotFoundError } from '@src/errors/NotFoundError';
import { ICacheService } from '@src/infra/cache/redis/ICacheService';
import { ITaskRepository } from '@src/infra/database/mongoose/repositories/ITaskRepository';
import { createCacheServiceMock } from '@test/__mocks__/createCacheServiceMock';
import { createTaskRepoMock } from '@test/__mocks__/createTaskRepoMock';
import {
  createTask,
  createTaskResponseDTO,
  createTaskUpdateDTO,
  defaultTask,
} from '@test/__mocks__/taskFactory';
import Redis from 'ioredis';
import { ZodError } from 'zod';

describe('class Task Service', () => {
  let taskRepoMock: jest.Mocked<ITaskRepository>;
  let mockCacheService: jest.Mocked<ICacheService>;
  let taskService: TaskService;
  let redisInstance: Redis;
  let id: string;
  const errorDbMsg = 'database failure';
  const forcedZodError = new ZodError([
    {
      code: 'custom',
      path: ['anyField'],
      message: 'Forced test error',
    },
  ]);
  beforeEach(() => {
    // Necessary because method deletePages is called inside TaskService and is used the method 'smembers' of Redis
    jest.spyOn(Redis.prototype, 'smembers').mockResolvedValue([]);

    taskRepoMock = createTaskRepoMock();
    mockCacheService = createCacheServiceMock();
    redisInstance = new Redis({ lazyConnect: true });
    taskService = new TaskService(
      taskRepoMock,
      mockCacheService,
      redisInstance,
    );
    id = defaultTask.id;
  });
  describe('updateById', () => {
    it('should update and return valid taskResponseDTO', async () => {
      taskRepoMock.updateById.mockResolvedValue(createTask({ isDone: true }));
      jest
        .mocked(toTaskResponseDTO)
        .mockReturnValue(createTaskResponseDTO({ isDone: true }));

      const result = await taskService.updateById(
        id,
        createTaskUpdateDTO({ isDone: true }),
      );

      expect(taskRepoMock.updateById).toHaveBeenCalledTimes(1);
      expect(toTaskResponseDTO).toHaveBeenCalledTimes(1);

      expect(result).toStrictEqual(createTaskResponseDTO({ isDone: true }));
    });
    it('should propagate NotFoundError when task does not exist', async () => {
      taskRepoMock.updateById.mockResolvedValue(null);

      await expect(
        taskService.updateById(id, createTaskUpdateDTO({ isDone: true })),
      ).rejects.toBeInstanceOf(NotFoundError);

      expect(taskRepoMock.updateById).toHaveBeenCalledTimes(1);
      expect(toTaskResponseDTO).not.toHaveBeenCalled();
    });
    it('should propagate ZodError when parse fails', async () => {
      jest.mocked(toTaskResponseDTO).mockImplementation(() => {
        throw forcedZodError;
      });
      taskRepoMock.updateById.mockResolvedValue(defaultTask);

      await expect(
        taskService.updateById(id, createTaskUpdateDTO({ isDone: true })),
      ).rejects.toBeInstanceOf(ZodError);

      expect(taskRepoMock.updateById).toHaveBeenCalledTimes(1);
      expect(toTaskResponseDTO).toHaveBeenCalledTimes(1);
    });
    it('should propagate error when repository.updateById throws', async () => {
      taskRepoMock.updateById.mockRejectedValue(new Error(errorDbMsg));

      await expect(
        taskService.updateById(id, createTaskUpdateDTO({ title: 'testing' })),
      ).rejects.toThrow(errorDbMsg);

      expect(taskRepoMock.updateById).toHaveBeenCalledTimes(1);
      expect(toTaskResponseDTO).not.toHaveBeenCalled();
    });
  });
});
