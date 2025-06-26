import { ITaskRepository } from '@src/infra/database/mongoose/repositories/ITaskRepository';
import { ITaskService } from './ITaskService';
import { inject, injectable } from 'tsyringe';
import { TASK_REPOSITORY } from '@src/di/tokens';
import { PaginateResult } from 'mongoose';
import {
  Task,
  TaskCreateDTO,
  TaskPreview,
  TaskResponseDTO,
  TaskUpdateDTO,
} from '@src/domain/entities/Task';
import { NotFoundError } from '@src/errors/NotFoundError';
import { toTaskResponseDTO } from '../mappers/TaskMapper';

// Aqui declaramos os casos de uso. Além disso, usamos de DIP para servir uma fábrica de objeto - nesse caso, uma simples que cria apenas Task - para validar e retornar o objeto.

@injectable()
export class TaskService implements ITaskService {
  constructor(
    @inject(TASK_REPOSITORY)
    private readonly taskRepo: ITaskRepository,
  ) {}

  async create(data: TaskCreateDTO): Promise<TaskResponseDTO> {
    const taskPreview: TaskPreview = {
      ...data,
      ...{
        isDone: false,
      },
    };

    const task: Task = await this.taskRepo.create(taskPreview);

    return toTaskResponseDTO(task);
  }

  async getAll(
    page: number,
    limit: number,
  ): Promise<PaginateResult<TaskResponseDTO>> {
    const query: PaginateResult<Task> = await this.taskRepo.findAll(
      page,
      limit,
    );

    if (query.docs.length === 0)
      throw new NotFoundError({
        message: 'Page not found',
        context: {
          pageProvided: query.page,
          totalPages: query.totalPages,
        },
      });

    const tasksValidated: TaskResponseDTO[] = query.docs.map((task) =>
      toTaskResponseDTO(task),
    );

    const result: PaginateResult<TaskResponseDTO> = {
      ...query,
      ...{
        docs: tasksValidated,
      },
    };

    return result;
  }

  async getById(id: string): Promise<TaskResponseDTO | null> {
    const task: Task | null = await this.taskRepo.findById(id);
    if (!task)
      throw new NotFoundError({
        message: `Task not found`,
        context: {
          idProvided: id,
        },
      });

    return toTaskResponseDTO(task);
  }

  async updateById(id: string, data: TaskUpdateDTO): Promise<TaskResponseDTO> {
    const task: Task | null = await this.taskRepo.updateById(id, data);
    if (!task)
      throw new NotFoundError({
        message: `Task not found`,
        context: {
          idProvided: id,
        },
      });

    return toTaskResponseDTO(task);
  }

  async delete(id: string): Promise<void> {
    await this.taskRepo.delete(id);
  }
}
