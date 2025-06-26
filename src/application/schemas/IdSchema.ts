import { z } from 'zod';

export const idSchema = z
  .string()
  .length(24, { message: 'ID must have exactly 24 characters' })
  .regex(/^[0-9a-fA-F]{24}$/, { message: 'ID must be a valid hexadecimal' });
