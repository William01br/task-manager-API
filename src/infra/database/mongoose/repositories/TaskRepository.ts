import { ITaskRepository } from './ITaskRepository';
import { Task } from '@src/domain/entities/Task';
import { ITaskDocument } from '../models/TaskModel';
import { Model } from 'mongoose';
import { inject, injectable } from 'tsyringe';
import { TASK_MODEL } from '@src/di/tokens';

@injectable()
export class TaskRepository implements ITaskRepository {
  constructor(
    @inject(TASK_MODEL)
    private readonly taskModel: Model<ITaskDocument>,
  ) {}

  async create(task: Task): Promise<ITaskDocument> {
    const created = await this.taskModel.create(task);
    return created.save();
  }

  async findById(id: string): Promise<ITaskDocument | null> {
    const result = await this.taskModel.findById({ _id: id });
    return result;
  }

  async findAll(): Promise<ITaskDocument[]> {
    const result = await this.taskModel.find();
    return result;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.taskModel.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }
}
