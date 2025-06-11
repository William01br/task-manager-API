import { ITaskRepository } from '@src/infra/database/mongoose/repositories/ITaskRepository';
import { CreateTaskDTO } from '../schemas/TaskCreateSchema';
import {
  TaskResponseDTO,
  TaskResponseSchema,
} from '../schemas/TaskResponseDTO';
import { ITaskService } from './ITaskService';
import { inject, injectable } from 'tsyringe';
import { TASK_REPOSITORY } from '@src/di/tokens';

// Aqui declaramos os casos de uso. Além disso, usamos de DIP para servir uma fábrica de objeto - nesse caso, uma simples que cria apenas Task - para validar e retornar o objeto.

@injectable()
export class TaskService implements ITaskService {
  constructor(
    @inject(TASK_REPOSITORY)
    private readonly taskRepo: ITaskRepository,
  ) {}

  async create(data: CreateTaskDTO): Promise<TaskResponseDTO> {
    const inputValidate = {
      ...data,
      ...{
        isDone: false,
      },
    };

    const result = await this.taskRepo.create(inputValidate);

    const taskOutput = {
      id: result._id,
      title: result.title,
      description: result.description,
      isDone: result.isDone,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };

    const outputValidate = TaskResponseSchema.safeParse(taskOutput);
    if (!outputValidate.success)
      throw new Error('Zod Validation Error', {
        cause: outputValidate.error.issues,
      });

    return outputValidate.data;
  }

  async getAll(): Promise<TaskResponseDTO[]> {
    return new Promise<TaskResponseDTO[]>((resolve) => {
      setTimeout(() => {
        resolve([
          {
            title: 'title',
            description: 'description',
            id: 'id',
            isDone: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);
      }, 0);
    });
  }

  async getById(id: string): Promise<TaskResponseDTO> {
    console.log(id);
    return new Promise<TaskResponseDTO>((resolve) => {
      setTimeout(() => {
        resolve({
          title: 'title',
          description: 'description',
          id: 'id',
          isDone: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }, 0);
    });
  }

  async delete(id: string): Promise<void> {
    await this.taskRepo.delete(id);
  }
}
