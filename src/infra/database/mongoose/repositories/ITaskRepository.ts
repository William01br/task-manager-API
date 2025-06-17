import { ITaskDocument } from '@src/infra/database/mongoose/models/TaskModel';
import { Task } from '@src/domain/entities/Task';
import { PaginateResult } from 'mongoose';
import { UpdateTaskDTO } from '@src/application/schemas/TaskUpdateSchema';

// Define uma interface (contrato) para todas as operações de acesso a dados relacionados a "Task".

// Ela vai garantir que quem use essa interface, contenha esses métodos, independente da tecnologia (Mongoose | Prisma | TypeORM | In-Memory | etc... )

export interface ITaskRepository {
  create(task: Task): Promise<ITaskDocument>;
  findById(id: string): Promise<ITaskDocument | null>;
  findAll(page: number, limit: number): Promise<PaginateResult<ITaskDocument>>;
  updateById(id: string, data: UpdateTaskDTO): Promise<ITaskDocument | null>;
  delete(id: string): Promise<void>;
}
