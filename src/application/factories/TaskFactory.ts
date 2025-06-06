import { Task } from '@src/domain/entities/Task';
import { CreateTaskInput, TaskSchema } from '../schemas/TaskSchema';

export class TaskFactory {
  createNewTask(data: CreateTaskInput): Task {
    const result = TaskSchema.safeParse({ data });
    if (!result.success)
      throw new Error('Zod Validation Error', { cause: result.error });

    return new Task(result.data);
  }
}
