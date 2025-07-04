import { ITaskRepository } from '@src/infra/database/mongoose/repositories/ITaskRepository';

export const createTaskRepoMock = (): jest.Mocked<ITaskRepository> => {
  return {
    create: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    updateById: jest.fn(),
    delete: jest.fn(),
  };
};
