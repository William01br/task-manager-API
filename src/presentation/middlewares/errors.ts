import { NextFunction, Request, Response } from 'express';
import { CustomError } from '@src/errors/CustomError';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof CustomError) {
    const { statusCode, errors, logging } = err;
    if (logging) {
      console.error(
        JSON.stringify(
          {
            code: err.statusCode,
            errors: err.errors,
            stack: err.stack,
          },
          null,
          2,
        ),
      );
    }
    res.status(statusCode).json({ errors });
    return;
  }
  console.error(JSON.stringify(err, null, 2), err.stack);
  res.status(500).json({ errors: [{ message: 'Something went wrong' }] });
  return;
};
