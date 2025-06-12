import BadRequestError from '@src/errors/BadRequestError';
import { Request, Response, NextFunction } from 'express';
import type { ZodTypeAny, infer as Infer } from 'zod';

export function validateBody<S extends ZodTypeAny>(schema: S) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const issues = result.error.errors.map((e) => ({
        message: e.message,
        context: { path: e.path.join('.') },
      }));
      throw new BadRequestError({
        message: 'Validation failed',
        context: { issues },
        logging: true,
      });
    }

    req.body = result.data as Infer<S>;
    next();
  };
}
