import BadRequestError from '@src/errors/BadRequestError';
import { Request, Response, NextFunction } from 'express';
import type { SafeParseReturnType, ZodTypeAny } from 'zod';

export function validateParam(paramName: string, schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    const raw = req.params[paramName];
    const result: SafeParseReturnType<string, string> = schema.safeParse(raw);
    if (!result.success) {
      const issues = result.error.errors.map((e) => ({
        message: e.message,
        context: { path: e.path.join('.') },
      }));
      throw new BadRequestError({
        message: `Invalid parameter ${paramName}`,
        context: { issues },
        logging: true,
      });
    }

    req.params[paramName] = result.data;
    next();
    return;
  };
}
