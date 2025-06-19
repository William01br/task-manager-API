import { PaginateResult } from 'mongoose';
import { UpdateTaskDTO } from '../schemas/TaskUpdateSchema';
import { TaskCreateDTO, TaskResponseDTO } from '@src/domain/entities/Task';

export interface ITaskService {
  create(data: TaskCreateDTO): Promise<TaskResponseDTO>;
  getAll(page: number, limit: number): Promise<PaginateResult<TaskResponseDTO>>;
  getById(id: string): Promise<TaskResponseDTO | null>;
  updateById(id: string, data: UpdateTaskDTO): Promise<TaskResponseDTO>;
  delete(id: string): Promise<void>;
}
