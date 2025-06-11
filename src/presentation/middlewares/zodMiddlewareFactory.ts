import { Request, Response, NextFunction } from 'express';
import type { ZodTypeAny, infer as Infer } from 'zod';

export function validateBody<S extends ZodTypeAny>(schema: S) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ errors: result.error.format() });
      return;
    }

    req.body = result.data as Infer<S>;
    next();
  };
}
