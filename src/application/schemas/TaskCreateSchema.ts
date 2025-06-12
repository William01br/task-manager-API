import { z } from 'zod';

export const TaskCreateSchema = z.object({
  title: z.string().nonempty(),
  description: z.string().optional().default(''),
});

export type CreateTaskDTO = z.infer<typeof TaskCreateSchema>;
