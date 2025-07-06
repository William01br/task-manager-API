import { ITaskRepository } from './ITaskRepository';
import { Task, TaskPreview, TaskUpdateDTO } from '@src/domain/entities/Task';
import { ITaskDocument, ITaskModel } from '../models/TaskModel';
import { inject, injectable } from 'tsyringe';
import { TASK_MODEL } from '@src/di/tokens';
import { PaginateOptions, PaginateResult } from 'mongoose';

@injectable()
export class TaskRepository implements ITaskRepository {
  constructor(
    @inject(TASK_MODEL)
    private readonly taskModel: ITaskModel,
  ) {}

  async create(task: TaskPreview): Promise<Task> {
    const result = (await this.taskModel.create(task)).save();
    const doc = (await result).toObject();
    const obj = this.serializeDocument(doc);
    return obj;
  }

  async findById(id: string): Promise<Task | null> {
    const result = await this.taskModel.findById(id).lean();
    if (!result) return null;

    const obj = this.serializeDocument(result);
    return obj;
  }

  async findAll(page: number, limit: number): Promise<PaginateResult<Task>> {
    const options: PaginateOptions = { page, limit, lean: true };
    const result: PaginateResult<ITaskDocument> = await this.taskModel.paginate(
      {},
      options,
    );
    const { docs: docs, ...rest } = result;
    const newDocs = docs.map((doc) => this.serializeDocument(doc));

    const newResult = {
      ...rest,
      docs: newDocs,
    };
    return newResult;
  }

  async updateById(id: string, data: TaskUpdateDTO): Promise<Task | null> {
    const result = await this.taskModel.findByIdAndUpdate(
      id,
      { $set: data },
      {
        returnDocument: 'after',
        timestamps: true,
      },
    );
    if (!result) return null;

    const doc = result.toObject();
    const obj = this.serializeDocument(doc);
    return obj;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.taskModel.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }

  private serializeDocument(document: ITaskDocument): Task {
    const response = {
      id: document._id.toString(),
      title: document.title,
      description: document.description,
      isDone: document.isDone,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
    return response;
  }
}
