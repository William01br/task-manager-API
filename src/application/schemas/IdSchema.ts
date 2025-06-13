import { z } from 'zod';

// export const objectIdSchema = z.object({
//   id: z
//     .string()
//     .length(24, { message: 'ID must have exactly 24 characters' })
//     .regex(/^[0-9a-fA-F]{24}$/, { message: 'ID must be a valid hexadecimal' }),
// });
export const objectIdSchema = z
  .string()
  .length(24, { message: 'ID must have exactly 24 characters' })
  .regex(/^[0-9a-fA-F]{24}$/, { message: 'ID must be a valid hexadecimal' });

export type ObjectIdString = z.infer<typeof objectIdSchema>;
