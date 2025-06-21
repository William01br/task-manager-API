jest.mock('@src/application/mappers/TaskMapper', () => ({
  toTaskResponseDTO: jest.fn(),
}));

import { toTaskResponseDTO } from '@src/application/mappers/TaskMapper';
import { StringIdObject } from '@src/application/schemas/IdSchema';
import { TaskService } from '@src/application/services/TaskService';
import {
  Task,
  TaskCreateDTO,
  TaskPreview,
  TaskResponseDTO,
} from '@src/domain/entities/Task';
import { NotFoundError } from '@src/errors/NotFoundError';
import { ITaskRepository } from '@src/infra/database/mongoose/repositories/ITaskRepository';
import { ZodError } from 'zod';

const errorDbMsg = 'database failure';

describe('class Task Service', () => {
  let taskRepoMock: jest.Mocked<ITaskRepository>;
  let taskService: TaskService;
  let date: Date;
  let id: StringIdObject;
  let mockTaskCreateDTO: TaskCreateDTO;
  let mockTaskPreview: TaskPreview;
  let mockTaskResponseExpected: TaskResponseDTO;
  let mockTask: Task;

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
    id = '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d';

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
        throw new ZodError([
          {
            code: 'custom',
            path: ['anyField'],
            message: 'Erro forçado de teste',
          },
        ]);
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
        throw new ZodError([
          {
            code: 'custom',
            path: ['anyField'],
            message: 'Erro forçado de teste',
          },
        ]);
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
});
