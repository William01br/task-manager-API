jest.mock('@src/application/mappers/TaskMapper', () => ({
  toTaskResponseDTO: jest.fn(),
}));

import { toTaskResponseDTO } from '@src/application/mappers/TaskMapper';
import { TaskService } from '@src/application/services/TaskService';
import {
  Task,
  TaskCreateDTO,
  TaskPreview,
  TaskResponseDTO,
  TaskUpdateDTO,
} from '@src/domain/entities/Task';
import { NotFoundError } from '@src/errors/NotFoundError';
import { ITaskRepository } from '@src/infra/database/mongoose/repositories/ITaskRepository';
import { PaginateResult, Types } from 'mongoose';
import { ZodError } from 'zod';

let taskRepoMock: jest.Mocked<ITaskRepository>;
let taskService: TaskService;
let date: Date;
let id: string;
let mockTaskCreateDTO: TaskCreateDTO;
let mockTaskPreview: TaskPreview;
let mockTaskResponseExpected: TaskResponseDTO;
let mockTask: Task;
let mockPaginateResult: PaginateResult<TaskResponseDTO>;
let mockPaginateDocUndefined: PaginateResult<Task>;
let mockPagineResultTask: PaginateResult<Task>;
let mockBody: TaskUpdateDTO;
let mockTaskUpdateExpected: TaskResponseDTO;
let mockTaskUpdate: Task;
const errorDbMsg = 'database failure';
const forcedZodError = new ZodError([
  {
    code: 'custom',
    path: ['anyField'],
    message: 'Forced test error',
  },
]);

describe('class Task Service', () => {
  beforeEach(() => {
    taskRepoMock = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      updateById: jest.fn(),
      delete: jest.fn(),
    };

    taskService = new TaskService(taskRepoMock);

    date = new Date('2025-06-20T12:34:56.789Z');
    id = new Types.ObjectId().toHexString();

    mockTaskCreateDTO = {
      title: 'test',
      description: 'testing',
    };
    mockTaskPreview = {
      ...mockTaskCreateDTO,
      isDone: false,
    };
    mockTask = {
      ...mockTaskPreview,
      id,
      createdAt: date,
      updatedAt: date,
    };
    mockTaskResponseExpected = {
      ...mockTaskPreview,
      id,
      createdAt: date.toISOString(),
      updatedAt: date.toISOString(),
    };
    mockPaginateResult = {
      totalDocs: 2,
      limit: 2,
      totalPages: 1,
      page: 1,
      offset: 0,
      pagingCounter: 1,
      hasPrevPage: false,
      hasNextPage: false,
      prevPage: null,
      nextPage: null,
      docs: [
        {
          ...mockTaskResponseExpected,
          ...mockTaskResponseExpected,
        },
      ],
    };
    const { docs: _, ...rest } = mockPaginateResult;
    mockPaginateDocUndefined = {
      docs: [],
      ...rest,
      ...{
        totalDocs: 0,
      },
    };
    mockPagineResultTask = {
      docs: [
        {
          ...mockTask,
          ...mockTask,
        },
      ],
      ...rest,
    };
    mockBody = {
      isDone: true,
    };
    mockTaskUpdateExpected = {
      ...mockTaskResponseExpected,
      ...{ isDone: true },
    };
    mockTaskUpdate = {
      ...mockTask,
      ...{
        isDone: true,
      },
    };
  });

  describe('create', () => {
    it('should return valid taskResponseDTO', async () => {
      jest.mocked(toTaskResponseDTO).mockReturnValue(mockTaskResponseExpected);
      taskRepoMock.create.mockResolvedValue(mockTask);

      const result = await taskService.create(mockTaskCreateDTO);

      expect(taskRepoMock.create).toHaveBeenCalledTimes(1);
      expect(taskRepoMock.create).toHaveBeenCalledWith(mockTaskPreview);
      expect(toTaskResponseDTO).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual(mockTaskResponseExpected);
    });

    it('should propagate ZodError when parse fails', async () => {
      jest.mocked(toTaskResponseDTO).mockImplementation(() => {
        throw forcedZodError;
      });

      taskRepoMock.create.mockResolvedValue(mockTask);
      await expect(
        taskService.create(mockTaskCreateDTO),
      ).rejects.toBeInstanceOf(ZodError);

      expect(taskRepoMock.create).toHaveBeenCalledTimes(1);
      expect(toTaskResponseDTO).toHaveBeenCalledTimes(1);
    });

    it('should propagate error when repository.create throws', async () => {
      taskRepoMock.create.mockRejectedValue(new Error(errorDbMsg));

      await expect(taskService.create(mockTaskCreateDTO)).rejects.toThrow(
        errorDbMsg,
      );
      expect(taskRepoMock.create).toHaveBeenCalledTimes(1);
      expect(toTaskResponseDTO).not.toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should return should return valid taskResponseDTO', async () => {
      taskRepoMock.findById.mockResolvedValue(mockTask);
      jest.mocked(toTaskResponseDTO).mockReturnValue(mockTaskResponseExpected);

      const result = await taskService.getById(id);

      expect(taskRepoMock.findById).toHaveBeenCalledTimes(1);
      expect(taskRepoMock.findById).toHaveBeenCalledWith(id);
      expect(toTaskResponseDTO).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual(mockTaskResponseExpected);
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
      taskRepoMock.findById.mockResolvedValue(mockTask);

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
      taskRepoMock.findAll.mockResolvedValue(mockPagineResultTask);
      jest.mocked(toTaskResponseDTO).mockReturnValue(mockTaskResponseExpected);

      const result = await taskService.getAll(1, 2);

      expect(taskRepoMock.findAll).toHaveBeenCalledTimes(1);
      expect(toTaskResponseDTO).toHaveBeenCalledTimes(
        mockPaginateResult.docs.length,
      );

      expect(result).toStrictEqual(mockPaginateResult);
    });
    it('should progagate NotFoundError when page not have tasks', async () => {
      taskRepoMock.findAll.mockResolvedValue(mockPaginateDocUndefined);

      await expect(taskService.getAll(1, 2)).rejects.toBeInstanceOf(
        NotFoundError,
      );
    });
    it('should propagate ZodError when parse fails', async () => {
      jest.mocked(toTaskResponseDTO).mockImplementation(() => {
        throw forcedZodError;
      });
      taskRepoMock.findAll.mockResolvedValue(mockPagineResultTask);

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
  describe('updateById', () => {
    it('should update and return valid taskResponseDTO', async () => {
      taskRepoMock.updateById.mockResolvedValue(mockTaskUpdate);
      jest.mocked(toTaskResponseDTO).mockReturnValue(mockTaskUpdateExpected);

      const result = await taskService.updateById(id, mockBody);

      expect(taskRepoMock.updateById).toHaveBeenCalledTimes(1);
      expect(toTaskResponseDTO).toHaveBeenCalledTimes(1);

      expect(result).toStrictEqual(mockTaskUpdateExpected);
    });
    it('should propagate NotFoundError when task does not exist', async () => {
      taskRepoMock.updateById.mockResolvedValue(null);

      await expect(taskService.updateById(id, mockBody)).rejects.toBeInstanceOf(
        NotFoundError,
      );

      expect(taskRepoMock.updateById).toHaveBeenCalledTimes(1);
      expect(toTaskResponseDTO).not.toHaveBeenCalled();
    });
    it('should propagate ZodError when parse fails', async () => {
      jest.mocked(toTaskResponseDTO).mockImplementation(() => {
        throw forcedZodError;
      });
      taskRepoMock.updateById.mockResolvedValue(mockTask);

      await expect(taskService.updateById(id, mockBody)).rejects.toBeInstanceOf(
        ZodError,
      );

      expect(taskRepoMock.updateById).toHaveBeenCalledTimes(1);
      expect(toTaskResponseDTO).toHaveBeenCalledTimes(1);
    });
    it('should propagate error when repository.updateById throws', async () => {
      taskRepoMock.updateById.mockRejectedValue(new Error(errorDbMsg));

      await expect(taskService.updateById(id, mockBody)).rejects.toThrow(
        errorDbMsg,
      );

      expect(taskRepoMock.updateById).toHaveBeenCalledTimes(1);
      expect(toTaskResponseDTO).not.toHaveBeenCalled();
    });
  });
  describe('delete', () => {
    it('should return void when the task was deleted or does not exist', async () => {
      taskRepoMock.delete.mockResolvedValue();

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
