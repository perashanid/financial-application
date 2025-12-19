import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
  statusCode: number;
  code: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error code to status code mapping
const errorCodeMap: Record<string, number> = {
  EMAIL_ALREADY_EXISTS: 409,
  PHONE_ALREADY_EXISTS: 409,
  AUTH_CREDENTIALS_INVALID: 401,
  ACCOUNT_SUSPENDED: 403,
  AUTH_2FA_REQUIRED: 401,
  AUTH_TOKEN_INVALID: 401,
  AUTH_TOKEN_EXPIRED: 401,
  AUTH_TOKEN_MISSING: 401,
  FORBIDDEN_ACTION: 403,
  RESOURCE_NOT_FOUND: 404,
  VALIDATION_FAILED: 400,
  MISSING_REQUIRED_FIELD: 400,
};

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    logger.error(`${err.code}: ${err.message}`, {
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
    });

    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }

  // Handle known error codes
  if (err.message && errorCodeMap[err.message]) {
    const statusCode = errorCodeMap[err.message];
    logger.error(`${err.message}`, {
      statusCode,
      path: req.path,
      method: req.method,
    });

    return res.status(statusCode).json({
      success: false,
      error: {
        code: err.message,
        message: err.message.replace(/_/g, ' ').toLowerCase(),
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }

  logger.error('Unexpected error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown',
    },
  });
};
