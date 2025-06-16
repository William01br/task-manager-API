import { z } from 'zod';

export const pageSchema = z
  .string()
  .regex(/^[0-9]*$/, { message: 'The page must be a valid number.' })
  .transform(Number)
  .refine((val) => val >= 1, { message: 'The page must be greater than 0' });
