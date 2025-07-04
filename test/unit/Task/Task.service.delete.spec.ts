import { TaskService } from '@src/application/services/TaskService';
import { ICacheService } from '@src/infra/cache/redis/ICacheService';
import { ITaskRepository } from '@src/infra/database/mongoose/repositories/ITaskRepository';
import { createCacheServiceMock } from '@test/__mocks__/createCacheServiceMock';
import { createTaskRepoMock } from '@test/__mocks__/createTaskRepoMock';
import { defaultTask } from '@test/__mocks__/taskFactory';
import Redis from 'ioredis';

describe('class Task Service', () => {
  let taskRepoMock: jest.Mocked<ITaskRepository>;
  let mockCacheService: jest.Mocked<ICacheService>;
  let taskService: TaskService;
  let redisInstance: Redis;
  let id: string;
  const errorDbMsg = 'database failure';
  beforeEach(() => {
    // Necessary because method deletePages is called inside TaskService and is used the method 'smembers' of Redis
    jest.spyOn(Redis.prototype, 'smembers').mockResolvedValue([]);

    taskRepoMock = createTaskRepoMock();
    mockCacheService = createCacheServiceMock();
    redisInstance = new Redis();
    taskService = new TaskService(
      taskRepoMock,
      mockCacheService,
      redisInstance,
    );
    id = defaultTask.id;
  });
  describe('delete', () => {
    it('should return void when the task was deleted or does not exist', async () => {
      taskRepoMock.delete.mockResolvedValue(true);

      await expect(taskService.delete(id)).toBeInstanceOf(Promise<void>);

      expect(taskRepoMock.delete).toHaveBeenCalledTimes(1);
    });
    it('should propagate error when repository.delete throws', async () => {
      taskRepoMock.delete.mockRejectedValue(new Error(errorDbMsg));

      await expect(taskService.delete(id)).rejects.toThrow(errorDbMsg);

      expect(taskRepoMock.delete).toHaveBeenCalledTimes(1);
    });
  });
});
