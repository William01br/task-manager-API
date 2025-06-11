import { ITaskService } from '@src/application/services/ITaskService';
import { ITaskDocument } from '@src/infra/database/mongoose/models/TaskModel';
import { ITaskRepository } from '@src/infra/database/mongoose/repositories/ITaskRepository';
import { Model } from 'mongoose';
import { InjectionToken } from 'tsyringe';

export const TASK_SERVICE: InjectionToken<ITaskService> =
  Symbol.for('ITaskService');
export const TASK_REPOSITORY: InjectionToken<ITaskRepository> =
  Symbol.for('ITaskRepository');
export const TASK_MODEL: InjectionToken<Model<ITaskDocument>> =
  Symbol.for('ITaskDocument');
