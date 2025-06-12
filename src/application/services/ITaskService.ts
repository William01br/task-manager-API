import { CreateTaskDTO } from '../schemas/TaskCreateSchema';
import { TaskResponseDTO } from '../schemas/TaskResponseDTO';

export interface ITaskService {
  create(data: CreateTaskDTO): Promise<TaskResponseDTO>;
  getAll(): Promise<TaskResponseDTO[]>;
  getById(id: string): Promise<TaskResponseDTO>;
  delete(id: string): Promise<void>;
}
