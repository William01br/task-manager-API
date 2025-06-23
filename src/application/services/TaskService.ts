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
    const result = await this.taskRepo.findAll(page, limit);

    if (page > result.totalPages)
      throw new NotFoundError({
        message: `Page ${page} not found. Total of pages is ${result.totalPages}`,
      });

    const tasksValidated: TaskResponseDTO[] = result.docs.map((task) =>
      toTaskResponseDTO(task),
    );

    const { docs: _, ...rest } = result;

    const newResult: PaginateResult<TaskResponseDTO> = {
      ...rest,
      docs: tasksValidated,
    };

    return newResult;
  }

  async getById(id: string): Promise<TaskResponseDTO | null> {
    const task = await this.taskRepo.findById(id);
    if (!task)
      throw new NotFoundError({
        message: `Resource with id ${id} not found`,
      });

    return toTaskResponseDTO(task);
  }

  async updateById(id: string, data: TaskUpdateDTO): Promise<TaskResponseDTO> {
    const task = await this.taskRepo.updateById(id, data);
    if (!task)
      throw new NotFoundError({
        message: `Resource with id ${id} not found`,
      });

    return toTaskResponseDTO(task);
  }

  async delete(id: string): Promise<void> {
    await this.taskRepo.delete(id);
  }
}
