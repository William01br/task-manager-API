import { z } from 'zod';

const max = 100;

export const limitSchema = z
  .string()
  .regex(/^[0-9]*$/, { message: 'The limit must be a valid number' })
  .transform(Number)
  .refine((val) => isValidValue(val), {
    message: `The limit should be greater than 0 and not exceed ${max}`,
  });

function isValidValue(val: number): boolean {
  if (val < 1) return false;
  if (val > 100) return false;
  return true;
}
