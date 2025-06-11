import { Task } from '@src/domain/entities/Task';
import { CreateTaskDTO } from '../schemas/TaskCreateSchema';

export interface ITaskFactory {
  create(data: CreateTaskDTO): Task;
}
