import { Request, Response } from 'express';
import { Controller, Get, Middleware, Post } from '@overnightjs/core';
import {
  CreateTaskDTO,
  TaskCreateSchema,
} from '@src/application/schemas/TaskCreateSchema';
import { validateBody } from '../middlewares/zodMiddlewareFactory';
import { ITaskService } from '@src/application/services/ITaskService';
import { inject, injectable } from 'tsyringe';
import { TASK_SERVICE } from '@src/di/tokens';
import { validateParam } from '../middlewares/validateParamMiddleware';
import { idSchema } from '@src/application/schemas/IdSchema';

@injectable()
@Controller('api/tasks')
export class TaskController {
  constructor(
    @inject(TASK_SERVICE)
    private readonly taskService: ITaskService,
  ) {}

  @Post()
  @Middleware(validateBody(TaskCreateSchema))
  private async postHandler(
    req: Request<unknown, unknown, CreateTaskDTO>,
    res: Response,
  ): Promise<Response> {
    const { title, description } = req.body;

    const task = await this.taskService.create({ title, description });

    return res.status(200).json({ data: task });
  }

  @Get(':page/:limit')
  private async getAllHandler(
    req: Request<{ page: string; limit: string }>,
    res: Response,
  ): Promise<Response> {
    const { page, limit } = req.params;
    const tasks = await this.taskService.getAll(Number(page), Number(limit));

    return res.status(200).json({ data: tasks });
  }

  @Get(':id')
  @Middleware(validateParam('id', idSchema))
  private async getHandler(
    req: Request<{ id: string }>,
    res: Response,
  ): Promise<Response> {
    const id = req.params.id;

    const task = await this.taskService.getById(id);

    return res.status(200).json({ data: task });
  }
}
