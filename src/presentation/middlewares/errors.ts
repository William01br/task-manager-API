import { NextFunction, Request, Response } from 'express';
import { CustomError } from '@src/errors/CustomError';
// import { NotFoundError } from '@src/errors/NotFoundError';
import logger from '@src/logging/logger';
// import { reset } from 'module-alias';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof CustomError) {
    const { statusCode, errors, logging } = err;
    if (logging) {
      logger.warn(
        JSON.stringify(
          {
            code: err.statusCode,
            errors: err.errors,
          },
          null,
          2,
        ),
        err.stack,
      );
    }
    res.status(statusCode).json({ errors });
    return;
  }
  logger.error(JSON.stringify(err, null, 2), err.stack);
  res.status(500).json({ errors: [{ message: 'Something went wrong' }] });
  return;
};

export const NotFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  res.status(404).json({ message: 'Route not found' });
  return;
};
