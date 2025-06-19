import { z } from 'zod';
import { TaskCreateSchema } from './TaskCreateSchema';

export const TaskResponseSchema = TaskCreateSchema.merge(
  z.object({
    id: z.string(),
    isDone: z.boolean(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }),
);
