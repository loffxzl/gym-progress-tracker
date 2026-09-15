import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

/**
 * Centralized Express Error Handling Middleware.
 * Catches all operational and uncaught errors, logging them and returning a clean JSON response.
 */
export const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = env.NODE_ENV === 'production' && statusCode === 500
      ? 'Internal Server Error'
      : (error.message || 'Internal Server Error');
    error = new ApiError(statusCode, message, [], err.stack);
  }

  // Log full error details securely on server logs
  logger.error(error.message, {
    statusCode: error.statusCode,
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
    errors: error.errors,
    stack: error.stack,
  });

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    timestamp: new Date().toISOString(),
    ...(error.errors && error.errors.length > 0 && { errors: error.errors }),
    ...(env.NODE_ENV === 'development' && { stack: error.stack }),
  };

  res.status(error.statusCode).json(response);
};
