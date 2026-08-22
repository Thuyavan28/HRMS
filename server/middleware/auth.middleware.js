import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dayflow_super_secret_jwt_access_token_key_2026_!@#';

export const authenticateToken = (req, res, next) => {
  try {
    let token = null;

    // 1. Check HTTP-only cookie first
    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }
    // 2. Fallback to Authorization header Bearer token
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in.'
      });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            message: 'Session expired. Please refresh your session or sign in again.',
            code: 'TOKEN_EXPIRED'
          });
        }
        return res.status(401).json({
          success: false,
          message: 'Invalid session token. Please sign in again.'
        });
      }

      req.user = decoded;
      next();
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed.'
    });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const userRole = req.user.role;
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of [${roles.join(', ')}] permissions.`
      });
    }

    next();
  };
};

export const verifyResourceOwnership = (getOwnerIdFromReq) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    // Admins have universal read/write access
    if (req.user.role === 'admin') {
      return next();
    }

    const ownerId = typeof getOwnerIdFromReq === 'function' ? getOwnerIdFromReq(req) : req.params.employeeId || req.params.id;

    if (ownerId && ownerId !== req.user.employeeId && ownerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden: You cannot access or modify another employee\'s resource.'
      });
    }

    next();
  };
};
