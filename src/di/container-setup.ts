import { container } from 'tsyringe';
import {
  CACHE_SERVICE,
  TASK_MODEL,
  TASK_REPOSITORY,
  TASK_SERVICE,
} from './tokens';
import { TaskService } from '@src/application/services/TaskService';
import { ITaskRepository } from '@src/infra/database/mongoose/repositories/ITaskRepository';
import { ITaskDocument } from '@src/infra/database/mongoose/models/TaskModel';
import { TaskModel } from '@src/infra/database/mongoose/models/TaskModel';
import { TaskRepository } from '@src/infra/database/mongoose/repositories/TaskRepository';
import { ITaskService } from '@src/application/services/ITaskService';
import { Model } from 'mongoose';
import { ICacheService } from '@src/infra/cache/redis/ICacheService';
import { CacheService } from '@src/infra/cache/redis/CacheService';
import { redis } from '@src/config/cache';

container.register<ITaskService>(TASK_SERVICE, {
  useClass: TaskService,
});

container.register<ITaskRepository>(TASK_REPOSITORY, {
  useClass: TaskRepository,
});

container.register<Model<ITaskDocument>>(TASK_MODEL, {
  useValue: TaskModel,
});

container.register<ICacheService>(CACHE_SERVICE, {
  useClass: CacheService,
});

container.registerInstance('Redis', redis);
// container.register<RedisClientType>(REDIS_CLIENT, {
//   useValue: redisClient,
// });
