import { z } from 'zod';
import { TaskCreateSchema } from './TaskCreateSchema';
import { idSchema } from './IdSchema';

export const TaskResponseSchema = z.object({
  ...TaskCreateSchema.shape,
  id: idSchema,
  isDone: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
