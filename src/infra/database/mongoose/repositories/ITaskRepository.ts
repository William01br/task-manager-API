import { Task, TaskPreview, TaskUpdateDTO } from '@src/domain/entities/Task';
import { PaginateResult } from 'mongoose';

// Define uma interface (contrato) para todas as operações de acesso a dados relacionados a "Task".

// Ela vai garantir que quem use essa interface, contenha esses métodos, independente da tecnologia (Mongoose | Prisma | TypeORM | In-Memory | etc... )

export interface ITaskRepository {
  create(task: TaskPreview): Promise<Task>;
  findById(id: string): Promise<Task | null>;
  findAll(page: number, limit: number): Promise<PaginateResult<Task>>;
  updateById(id: string, data: TaskUpdateDTO): Promise<Task | null>;
  delete(id: string): Promise<boolean>;
}
