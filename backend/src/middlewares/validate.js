import { ApiError } from '../utils/ApiError.js';

/**
 * Express Middleware factory to validate incoming request data against a Zod schema.
 */
export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    req.body = parsed.body || req.body;
    req.query = parsed.query || req.query;
    req.params = parsed.params || req.params;
    next();
  } catch (error) {
    if (error.name === 'ZodError') {
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.join('.').replace('body.', '').replace('query.', '').replace('params.', ''),
        message: err.message,
      }));
      return next(ApiError.badRequest('Validation Error', formattedErrors));
    }
    next(error);
  }
};
