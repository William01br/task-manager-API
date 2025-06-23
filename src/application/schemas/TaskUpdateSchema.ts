import { z } from 'zod';

export const TaskUpdateSchema = z
  .object({
    title: z.string().trim().min(1).max(50).optional(),
    description: z.string().trim().optional(),
    isDone: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });
