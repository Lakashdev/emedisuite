const IS_PROD = process.env.NODE_ENV === "production";

/**
 * 404 handler — attach after all routes
 */
export function notFound(req, res, _next) {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
}

/**
 * Global error handler — must have 4 args for Express to treat it as error middleware
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal server error";

  // Log all 5xx, only log 4xx in dev
  if (status >= 500) {
    console.error("[ERROR]", err);
  } else if (!IS_PROD) {
    console.warn("[WARN]", err.message);
  }

  res.status(status).json({
    message,
    ...(IS_PROD ? {} : { stack: err.stack }),
  });
}
