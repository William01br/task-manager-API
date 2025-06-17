import { ITaskRepository } from './ITaskRepository';
import { Task } from '@src/domain/entities/Task';
import { ITaskDocument, ITaskModel } from '../models/TaskModel';
import { inject, injectable } from 'tsyringe';
import { TASK_MODEL } from '@src/di/tokens';
import { PaginateOptions, PaginateResult } from 'mongoose';
import { UpdateTaskDTO } from '@src/application/schemas/TaskUpdateSchema';

@injectable()
export class TaskRepository implements ITaskRepository {
  constructor(
    @inject(TASK_MODEL)
    private readonly taskModel: ITaskModel,
  ) {}

  async create(task: Task): Promise<ITaskDocument> {
    const created = await this.taskModel.create(task);
    return created.save();
  }

  async findById(id: string): Promise<ITaskDocument | null> {
    const result = await this.taskModel.findById(id);
    return result;
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<PaginateResult<ITaskDocument>> {
    const options: PaginateOptions = { page, limit };
    const result: PaginateResult<ITaskDocument> = await this.taskModel.paginate(
      {},
      options,
    );
    return result;
  }

  async updateById(
    id: string,
    data: UpdateTaskDTO,
  ): Promise<ITaskDocument | null> {
    const result = await this.taskModel.findByIdAndUpdate(
      id,
      { $set: data },
      {
        returnDocument: 'after',
        timestamps: true,
      },
    );
    return result;
  }

  async delete(id: string): Promise<void> {
    await this.taskModel.deleteOne({ _id: id });
  }
}
