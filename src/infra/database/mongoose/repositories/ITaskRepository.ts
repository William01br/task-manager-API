import { Task, TaskPreview } from '@src/domain/entities/Task';
import { PaginateResult } from 'mongoose';
import { UpdateTaskDTO } from '@src/application/schemas/TaskUpdateSchema';

// Define uma interface (contrato) para todas as operações de acesso a dados relacionados a "Task".

// Ela vai garantir que quem use essa interface, contenha esses métodos, independente da tecnologia (Mongoose | Prisma | TypeORM | In-Memory | etc... )

export interface ITaskRepository {
  create(task: TaskPreview): Promise<Task>;
  findById(id: string): Promise<Task | null>;
  findAll(page: number, limit: number): Promise<PaginateResult<Task>>;
  updateById(id: string, data: UpdateTaskDTO): Promise<Task | null>;
  delete(id: string): Promise<void>;
}
