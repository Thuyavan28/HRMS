// Unrestricted pass-through middlewares for full flexibility during development & testing
export const authRateLimiter = (req, res, next) => {
  next();
};

export const apiGeneralLimiter = (req, res, next) => {
  next();
};
