jest.mock('@src/application/mappers/TaskMapper', () => ({
  toTaskResponseDTO: jest.fn(),
}));
jest.mock('ioredis');

import { toTaskResponseDTO } from '@src/application/mappers/TaskMapper';
import { TaskService } from '@src/application/services/TaskService';
import { ICacheService } from '@src/infra/cache/redis/ICacheService';
import { ITaskRepository } from '@src/infra/database/mongoose/repositories/ITaskRepository';
import { createCacheServiceMock } from '@test/__mocks__/createCacheServiceMock';
import { createTaskRepoMock } from '@test/__mocks__/createTaskRepoMock';
import {
  defaultTask,
  defaultTaskCreateDTO,
  defaultTaskPreview,
  defaultTaskResponseDTO,
} from '@test/__mocks__/taskFactory';
import Redis from 'ioredis';
import { ZodError } from 'zod';

describe('class Task Service', () => {
  let taskRepoMock: jest.Mocked<ITaskRepository>;
  let mockCacheService: jest.Mocked<ICacheService>;
  let taskService: TaskService;
  let redisInstance: Redis;
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
  });

  describe('create', () => {
    it('should return valid taskResponseDTO', async () => {
      jest.mocked(toTaskResponseDTO).mockReturnValue(defaultTaskResponseDTO);
      taskRepoMock.create.mockResolvedValue(defaultTask);

      const result = await taskService.create(defaultTaskCreateDTO);

      expect(taskRepoMock.create).toHaveBeenCalledTimes(1);
      expect(taskRepoMock.create).toHaveBeenCalledWith(defaultTaskPreview);
      expect(toTaskResponseDTO).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual(defaultTaskResponseDTO);
    });

    it('should propagate ZodError when parse fails', async () => {
      jest.mocked(toTaskResponseDTO).mockImplementation(() => {
        throw forcedZodError;
      });

      taskRepoMock.create.mockResolvedValue(defaultTask);
      await expect(
        taskService.create(defaultTaskCreateDTO),
      ).rejects.toBeInstanceOf(ZodError);

      expect(taskRepoMock.create).toHaveBeenCalledTimes(1);
      expect(toTaskResponseDTO).toHaveBeenCalledTimes(1);
    });

    it('should propagate error when repository.create throws', async () => {
      taskRepoMock.create.mockRejectedValue(new Error(errorDbMsg));

      await expect(taskService.create(defaultTaskCreateDTO)).rejects.toThrow(
        errorDbMsg,
      );
      expect(taskRepoMock.create).toHaveBeenCalledTimes(1);
      expect(toTaskResponseDTO).not.toHaveBeenCalled();
    });
  });
});
