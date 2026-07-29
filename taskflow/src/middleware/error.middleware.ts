import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let statusCode = 500;
  let message = 'Internal Server Error';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    // Fallback for standard errors thrown from services/joi
    statusCode = 400; 
    message = err.message;
  }

  res.status(statusCode).json({
    status: 'error',
    message,
    // Only send the stack trace if we are in development mode!
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
  });
};
