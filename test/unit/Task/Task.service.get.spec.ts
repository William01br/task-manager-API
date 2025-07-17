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
  createPaginateResult,
  defaultTask,
  defaultTaskResponseDTO,
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
  afterAll(() => {
    redisInstance.disconnect();
  });
  describe('getById', () => {
    it('should return should return valid taskResponseDTO', async () => {
      taskRepoMock.findById.mockResolvedValue(defaultTask);
      jest.mocked(toTaskResponseDTO).mockReturnValue(defaultTaskResponseDTO);

      const result = await taskService.getById(id);

      expect(taskRepoMock.findById).toHaveBeenCalledTimes(1);
      expect(taskRepoMock.findById).toHaveBeenCalledWith(id);
      expect(toTaskResponseDTO).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual(defaultTaskResponseDTO);
    });
    it('should propagate NotFoundError when task does not exist', async () => {
      taskRepoMock.findById.mockResolvedValue(null);

      await expect(taskService.getById(id)).rejects.toBeInstanceOf(
        NotFoundError,
      );

      expect(taskRepoMock.findById).toHaveBeenCalledTimes(1);
      expect(toTaskResponseDTO).not.toHaveBeenCalled();
    });
    it('should propagate ZodError when parse fails', async () => {
      jest.mocked(toTaskResponseDTO).mockImplementation(() => {
        throw forcedZodError;
      });
      taskRepoMock.findById.mockResolvedValue(defaultTask);

      await expect(taskService.getById(id)).rejects.toBeInstanceOf(ZodError);

      expect(taskRepoMock.findById).toHaveBeenCalledTimes(1);
      expect(toTaskResponseDTO).toHaveBeenCalledTimes(1);
    });
    it('should propagate error when repository.findById throws', async () => {
      taskRepoMock.findById.mockRejectedValue(new Error(errorDbMsg));

      await expect(taskService.getById(id)).rejects.toThrow(errorDbMsg);

      expect(taskRepoMock.findById).toHaveBeenCalledTimes(1);
      expect(toTaskResponseDTO).not.toHaveBeenCalled();
    });
  });

  describe('getAll', () => {
    it('should return valid taskReponseDTO of type PaginateResult', async () => {
      /**
       * Necessary, since the method 'setPage' is call inside TaskService.findAll and have methods of Redis.
       */
      const fakePipeline = {
        set: jest.fn().mockReturnThis(),
        sadd: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };
      jest
        .spyOn(Redis.prototype, 'multi')
        .mockImplementationOnce(() => fakePipeline as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      taskRepoMock.findAll.mockResolvedValue(
        createPaginateResult([defaultTask, defaultTask]),
      );
      jest.mocked(toTaskResponseDTO).mockReturnValue(defaultTaskResponseDTO);

      const result = await taskService.getAll(1, 2);

      expect(taskRepoMock.findAll).toHaveBeenCalledTimes(1);
      expect(toTaskResponseDTO).toHaveBeenCalledTimes(2);

      expect(result).toStrictEqual(
        createPaginateResult([defaultTaskResponseDTO, defaultTaskResponseDTO]),
      );
    });
    it('should progagate NotFoundError when page not have tasks', async () => {
      taskRepoMock.findAll.mockResolvedValue(createPaginateResult());

      await expect(taskService.getAll(1, 2)).rejects.toBeInstanceOf(
        NotFoundError,
      );
    });
    it('should propagate ZodError when parse fails', async () => {
      jest.mocked(toTaskResponseDTO).mockImplementation(() => {
        throw forcedZodError;
      });
      taskRepoMock.findAll.mockResolvedValue(
        createPaginateResult([defaultTask]),
      );

      await expect(taskService.getAll(1, 2)).rejects.toBeInstanceOf(ZodError);

      expect(taskRepoMock.findAll).toHaveBeenCalledTimes(1);
      expect(toTaskResponseDTO).toHaveBeenCalledTimes(1);
    });
    it('should propagate error when repository.findAll throws', async () => {
      taskRepoMock.findAll.mockRejectedValue(new Error(errorDbMsg));

      await expect(taskService.getAll(1, 2)).rejects.toThrow(errorDbMsg);

      expect(taskRepoMock.findAll).toHaveBeenCalledTimes(1);
      expect(toTaskResponseDTO).not.toHaveBeenCalled();
    });
  });
});
