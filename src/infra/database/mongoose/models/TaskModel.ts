import { Schema, model, PaginateModel, Document } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

export interface ITaskDocument extends Document {
  title: string;
  description: string;
  isDone: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITaskModel extends PaginateModel<ITaskDocument> {} // eslint-disable-line @typescript-eslint/no-empty-object-type

const TaskSchema = new Schema<ITaskDocument>(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    isDone: { type: Boolean, required: true, default: false },
  },
  {
    timestamps: true,
  },
);

TaskSchema.plugin(mongoosePaginate);

export const TaskModel = model<ITaskDocument, ITaskModel>('Task', TaskSchema);
