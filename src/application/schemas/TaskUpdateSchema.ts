import { z } from 'zod';

export const TaskUpdateSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  isDone: z.boolean().optional(),
});

export type UpdateTaskDTO = z.infer<typeof TaskUpdateSchema>;
