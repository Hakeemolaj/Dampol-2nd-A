import { Request, Response, NextFunction } from 'express';
import { CustomError } from './errorHandler';

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const message = `Route ${req.originalUrl} not found on this server!`;
  next(new CustomError(message, 404));
};
