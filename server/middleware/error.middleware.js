export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found.`
  });
};

export const globalErrorHandler = (err, req, res, next) => {
  // Log error internally
  console.error('[Error Handler]', {
    method: req.method,
    url: req.originalUrl,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  
  // Generic safe message for client
  const clientMessage = statusCode >= 500
    ? 'An unexpected server error occurred. Please try again later.'
    : (err.message || 'Request failed.');

  res.status(statusCode).json({
    success: false,
    message: clientMessage
  });
};
