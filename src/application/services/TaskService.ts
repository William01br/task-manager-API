import { ITaskRepository } from '@src/infra/database/mongoose/repositories/ITaskRepository';
import { ITaskService } from './ITaskService';
import { inject, injectable } from 'tsyringe';
import { CACHE_SERVICE, TASK_REPOSITORY } from '@src/di/tokens';
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
import { ICacheService } from '@src/infra/cache/redis/ICacheService';
import Redis from 'ioredis';

@injectable()
export class TaskService implements ITaskService {
  constructor(
    @inject(TASK_REPOSITORY)
    private readonly taskRepo: ITaskRepository,

    @inject(CACHE_SERVICE)
    private readonly redis: ICacheService,

    @inject('Redis')
    private readonly clientRedis: Redis,
  ) {}

  async create(data: TaskCreateDTO): Promise<TaskResponseDTO> {
    const taskPreview: TaskPreview = {
      ...data,
      ...{
        isDone: false,
      },
    };

    const task: Task = await this.taskRepo.create(taskPreview);

    await this.deletePages();

    return toTaskResponseDTO(task);
  }

  async getAll(
    page: number,
    limit: number,
  ): Promise<PaginateResult<TaskResponseDTO>> {
    const listKey = `tasks:page:${page}:limit:${limit}`;
    const cacheResult: PaginateResult<TaskResponseDTO> | null =
      await this.redis.get(listKey);
    if (cacheResult) {
      console.log(cacheResult);
      return cacheResult;
    }

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
    /**
    The strategy for cache invalidation was group-based with Tag-based Invalidation.

    - The invalidation is performed by O(N), where N is the number of keys registered in the tag set.
    - All pages in cache are deleted imediately.
    - About scalibility: is necessary care about much pages in cache. - But in this case, was accepted trade-off because is system for one user, since is a Task-Manager.
     */
    await this.setPage(page, limit, result);
    return result;
  }

  async getById(id: string): Promise<TaskResponseDTO | null> {
    const cacheKey = `task:${id}`;
    const cached: TaskResponseDTO | null = await this.redis.get(cacheKey);
    if (cached) return cached;

    const task: Task | null = await this.taskRepo.findById(id);
    if (!task)
      throw new NotFoundError({
        message: `Task not found`,
        context: {
          idProvided: id,
        },
      });

    const result = toTaskResponseDTO(task);
    await this.redis.set(cacheKey, result);
    return result;
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

    await this.redis.set(`task:${id}`, task);
    await this.deletePages();

    return toTaskResponseDTO(task);
  }

  async delete(id: string): Promise<void> {
    const result = await this.taskRepo.delete(id);
    if (result) await this.deletePages();
  }

  private async setPage(
    page: number,
    limit: number,
    data: PaginateResult<TaskResponseDTO>,
  ): Promise<void> {
    const key = `tasks:page:${page}:limit:${limit}`;
    console.log('ESTOU NO SET');
    await this.clientRedis
      .multi()
      .set(key, JSON.stringify(data), 'EX', 60)
      .sadd(`tag:tasks`, key)
      .exec();
  }
  private async deletePages(): Promise<void> {
    const tag = `tag:tasks`;

    const keys = await this.clientRedis.smembers(tag);
    console.log(keys);
    if (keys.length) {
      await this.clientRedis.del(...keys); // delete all keys
      await this.clientRedis.del(tag); // remove the tags set
    }
  }
}
