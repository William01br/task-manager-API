import { Task } from '../entities/Task';

// Define uma interface (contrato) para todas as operações de acesso a dados relacionados a "Task".

// Ela vai garantir que quem use essa interface, contenha esses métodos, independente da tecnologia (Mongoose | Prisma | TypeORM | In-Memory | etc... )

export interface ITaskRepository {
  create(task: Task): Promise<Task>;
  findById(id: string): Promise<Task | null>;
  findAll(): Promise<Task[]>;
  delete(id: string): Promise<boolean>;
}
