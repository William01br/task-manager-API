import { z } from 'zod';
import { TaskCreateSchema } from './TaskCreateSchema';
// import { Types } from 'mongoose';

export const TaskResponseSchema = TaskCreateSchema.merge(
  // z.object({
  //   id: z.preprocess((val) => {
  //     if (val instanceof Types.ObjectId) return val.toString();
  //     return val;
  //   }, z.string()),
  z.object({
    id: z.string(),
    isDone: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
  }),
);

export type TaskResponseDTO = z.infer<typeof TaskResponseSchema>;
