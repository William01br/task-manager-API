import {
  Task,
  TaskResponseDTO,
  TaskPreview,
  TaskCreateDTO,
  TaskUpdateDTO,
} from '@src/domain/entities/Task';
import { PaginateResult, Types } from 'mongoose';

const id = new Types.ObjectId().toHexString();
const date = new Date('2001-01-01T12:00:00.000Z');

export const defaultTaskCreateDTO: TaskCreateDTO = {
  title: 'default',
  description: 'description default',
};

export const defaultTaskPreview: TaskPreview = {
  ...defaultTaskCreateDTO,
  isDone: false,
};

export const defaultTask: Task = {
  id,
  ...defaultTaskPreview,
  createdAt: date,
  updatedAt: date,
};

export const defaultTaskResponseDTO: TaskResponseDTO = {
  ...defaultTask,
  ...{
    createdAt: date.toISOString(),
    updatedAt: date.toISOString(),
  },
};

export function createTask(overrides: Partial<Task> = {}): Task {
  return {
    ...defaultTask,
    ...overrides,
  };
}

export function createTaskUpdateDTO(
  overrides: Partial<TaskUpdateDTO> = {},
): TaskUpdateDTO {
  return {
    ...defaultTaskPreview,
    ...overrides,
  };
}

export function createTaskResponseDTO(
  overrides: Partial<TaskResponseDTO> = {},
): TaskResponseDTO {
  return {
    ...defaultTaskResponseDTO,
    ...overrides,
  };
}

export function createPaginateResult<T>(
  docs: T[] = [],
  overrides: Partial<PaginateResult<T>> = {},
): PaginateResult<T> {
  const defaultPaginateResult: PaginateResult<T> = {
    docs,
    totalDocs: docs.length,
    limit: 10,
    totalPages: 1,
    page: 1,
    offset: 0,
    pagingCounter: 1,
    hasPrevPage: false,
    hasNextPage: false,
    prevPage: null,
    nextPage: null,
  } as PaginateResult<T>;

  return {
    ...defaultPaginateResult,
    ...overrides,

    docs: overrides.docs ?? docs,
  };
}
