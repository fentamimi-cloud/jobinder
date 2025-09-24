import { Request, Response, NextFunction } from 'express';
import { logger } from '@shared/utils/logger';
import { ApiResponse } from '@shared/types/api';

export function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.error('Unhandled error:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Default error response
  let statusCode = 500;
  let message = 'Internal server error';

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
  } else if (error.name === 'ForbiddenError') {
    statusCode = 403;
    message = 'Forbidden';
  } else if (error.name === 'NotFoundError') {
    statusCode = 404;
    message = 'Resource not found';
  } else if (error.name === 'ConflictError') {
    statusCode = 409;
    message = 'Resource conflict';
  }

  // Firebase specific errors
  if (error.code === 'auth/id-token-expired') {
    statusCode = 401;
    message = 'Token expired';
  } else if (error.code === 'auth/id-token-revoked') {
    statusCode = 401;
    message = 'Token revoked';
  }

  const response: ApiResponse = {
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error.message : undefined,
  };

  res.status(statusCode).json(response);
}
