import { ITaskRepository } from '@src/infra/database/mongoose/repositories/ITaskRepository';
import { CreateTaskDTO } from '../schemas/TaskCreateSchema';
import {
  TaskResponseDTO,
  TaskResponseSchema,
} from '../schemas/TaskResponseDTO';
import { ITaskService } from './ITaskService';
import { inject, injectable } from 'tsyringe';
import { TASK_REPOSITORY } from '@src/di/tokens';
import { ITaskDocument } from '@src/infra/database/mongoose/models/TaskModel';
import { PaginateResult } from 'mongoose';
import { Task } from '@src/domain/entities/Task';
import { NotFoundError } from '@src/errors/NotFoundError';

// Aqui declaramos os casos de uso. Além disso, usamos de DIP para servir uma fábrica de objeto - nesse caso, uma simples que cria apenas Task - para validar e retornar o objeto.

@injectable()
export class TaskService implements ITaskService {
  constructor(
    @inject(TASK_REPOSITORY)
    private readonly taskRepo: ITaskRepository,
  ) {}

  async create(data: CreateTaskDTO): Promise<TaskResponseDTO> {
    const inputValidate: Task = {
      ...data,
      ...{
        isDone: false,
      },
    };

    const result: ITaskDocument = await this.taskRepo.create(inputValidate);

    const validateOutput: TaskResponseDTO = this.validateOutput(result);

    return validateOutput;
  }

  async getAll(
    page: number,
    limit: number,
  ): Promise<PaginateResult<TaskResponseDTO>> {
    const result = await this.taskRepo.findAll(page, limit);

    this.pageIsValid(result.totalPages, page);

    const tasksValidated: TaskResponseDTO[] = result.docs.map((task) =>
      this.validateOutput(task),
    );

    const { docs: _, ...rest } = result; // eslint-disable-line @typescript-eslint/no-unused-vars

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
        logging: true,
      });

    const taskValidated = this.validateOutput(task);

    return taskValidated;
  }

  async delete(id: string): Promise<void> {
    await this.taskRepo.delete(id);
  }

  private validateOutput(data: ITaskDocument): TaskResponseDTO {
    const task = {
      id: data._id,
      title: data.title,
      description: data.description,
      isDone: data.isDone,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };

    const outputValidate = TaskResponseSchema.parse(task);
    return outputValidate;
  }

  private pageIsValid(totalPages: number, page: number): void {
    if (page > totalPages)
      throw new NotFoundError({
        message: `Page ${page} not found. Total of pages is ${totalPages}`,
      });
  }
}
