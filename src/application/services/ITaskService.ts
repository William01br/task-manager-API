import { CreateTaskDTO } from '../schemas/TaskCreateSchema';
import { TaskResponseDTO } from '../schemas/TaskResponseDTO';
import { PaginateResult } from 'mongoose';
import { UpdateTaskDTO } from '../schemas/TaskUpdateSchema';

export interface ITaskService {
  create(data: CreateTaskDTO): Promise<TaskResponseDTO>;
  getAll(page: number, limit: number): Promise<PaginateResult<TaskResponseDTO>>;
  getById(id: string): Promise<TaskResponseDTO | null>;
  updateById(id: string, data: UpdateTaskDTO): Promise<TaskResponseDTO>;
  delete(id: string): Promise<void>;
}
