import { Task, TaskPreview, TaskUpdateDTO } from '@src/domain/entities/Task';
import { PaginateResult } from 'mongoose';

export interface ITaskRepository {
  create(task: TaskPreview): Promise<Task>;
  findById(id: string): Promise<Task | null>;
  findAll(page: number, limit: number): Promise<PaginateResult<Task>>;
  updateById(id: string, data: TaskUpdateDTO): Promise<Task | null>;
  delete(id: string): Promise<boolean>;
}
