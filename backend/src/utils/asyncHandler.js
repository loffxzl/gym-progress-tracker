/**
 * Higher-Order Function that wraps asynchronous Express route handlers.
 * Catches unhandled promise rejections and forwards them to next(err).
 * Eliminates repetitive try/catch boilerplate across controllers.
 */
export const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};
