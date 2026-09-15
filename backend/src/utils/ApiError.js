/**
 * Custom operational error class extending native JS Error.
 * Attaches HTTP status code and field-level validation errors.
 */
export class ApiError extends Error {
  constructor(statusCode, message = 'Something went wrong', errors = [], stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(msg = 'Bad Request', errors = []) {
    return new ApiError(400, msg, errors);
  }

  static unauthorized(msg = 'Unauthorized Access') {
    return new ApiError(401, msg);
  }

  static forbidden(msg = 'Forbidden Resource') {
    return new ApiError(403, msg);
  }

  static notFound(msg = 'Resource Not Found') {
    return new ApiError(404, msg);
  }

  static internal(msg = 'Internal Server Error') {
    return new ApiError(500, msg);
  }

  static tooManyRequests(msg = 'Too Many Requests', errors = []) {
    return new ApiError(429, msg, errors);
  }
}
