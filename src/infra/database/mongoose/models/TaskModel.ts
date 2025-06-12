import { Schema, model, Document } from 'mongoose';

export interface ITaskDocument extends Document {
  title: string;
  description: string;
  isDone: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchemaMongoose = new Schema<ITaskDocument>(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    isDone: { type: Boolean, required: true, default: false },
  },
  {
    timestamps: true,
  },
);

export const TaskModel = model<ITaskDocument>('Task', TaskSchemaMongoose);
