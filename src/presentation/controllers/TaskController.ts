import { Request, Response } from 'express';
import { Controller, Middleware, Post } from '@overnightjs/core';
import {
  CreateTaskDTO,
  TaskCreateSchema,
} from '@src/application/schemas/TaskCreateSchema';
import { validateBody } from '../middlewares/zodMiddlewareFactory';
import { TaskResponseDTO } from '@src/application/schemas/TaskResponseDTO';
import { ITaskService } from '@src/application/services/ITaskService';
import { inject, injectable } from 'tsyringe';
import { TASK_SERVICE } from '@src/di/tokens';

@injectable()
@Controller('api/tasks/')
export class TaskController {
  constructor(
    @inject(TASK_SERVICE)
    private readonly taskService: ITaskService,
  ) {}

  @Post()
  @Middleware(validateBody(TaskCreateSchema))
  private async add(
    req: Request<unknown, TaskResponseDTO, CreateTaskDTO>,
    res: Response,
  ): Promise<Response> {
    try {
      const { title, description } = req.body;

      const task = await this.taskService.create({ title, description });

      return res.status(200).json({ data: task });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error });
    }
  }
}
