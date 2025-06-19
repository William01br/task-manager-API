import { Task, TaskResponseDTO } from '@src/domain/entities/Task';
import { TaskResponseSchema } from '../schemas/TaskResponseDTO';

export function toTaskResponseDTO(data: Task): TaskResponseDTO {
  const { createdAt, updatedAt, ...rest } = data;
  const task = {
    ...rest,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };

  return TaskResponseSchema.parse(task);
}
