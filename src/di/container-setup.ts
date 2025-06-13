import { container } from 'tsyringe';
import { TASK_MODEL, TASK_REPOSITORY, TASK_SERVICE } from './tokens';
import { TaskService } from '@src/application/services/TaskService';
import { ITaskRepository } from '@src/infra/database/mongoose/repositories/ITaskRepository';
import { ITaskDocument } from '@src/infra/database/mongoose/models/TaskModel';
import { TaskModel } from '@src/infra/database/mongoose/models/TaskModel';
import { TaskRepository } from '@src/infra/database/mongoose/repositories/TaskRepository';
import { ITaskService } from '@src/application/services/ITaskService';
import { Model } from 'mongoose';

container.register<ITaskService>(TASK_SERVICE, {
  useClass: TaskService,
});

container.register<ITaskRepository>(TASK_REPOSITORY, {
  useClass: TaskRepository,
});

container.register<Model<ITaskDocument>>(TASK_MODEL, {
  useValue: TaskModel,
});
