import { CreateTaskDTO } from '../schemas/TaskCreateSchema';
import { TaskResponseDTO } from '../schemas/TaskResponseDTO';
import { PaginateResult } from 'mongoose';

export interface ITaskService {
  create(data: CreateTaskDTO): Promise<TaskResponseDTO>;
  getAll(page: number, limit: number): Promise<PaginateResult<TaskResponseDTO>>;
  getById(id: string): Promise<TaskResponseDTO | null>;
  delete(id: string): Promise<void>;
}
