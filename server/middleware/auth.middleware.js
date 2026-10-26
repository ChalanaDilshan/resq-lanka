import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

const JWT_SECRET = process.env.JWT_SECRET || 'resq_lanka_secure_dev_jwt_secret_key_2026_swt';

/**
 * Middleware: Verify JWT and attach authenticated user to req.user
 */
export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session or account deactivated.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please log in again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token.',
    });
  }
};

/**
 * Middleware: Enforce role-based access control (RBAC)
 * Supports canonical roles: 'citizen', 'volunteer', 'administrator'
 * Also accepts legacy 'coordinator' as an alias for 'administrator'
 */
export const requireRole = (...allowedRoles) => {
  // Normalize roles: allow bidirectional alias between coordinator and administrator
  const expandedRoles = new Set(allowedRoles);
  if (expandedRoles.has('coordinator')) {
    expandedRoles.add('administrator');
  }
  if (expandedRoles.has('administrator')) {
    expandedRoles.add('coordinator');
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    // Direct role match
    if (expandedRoles.has(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]. Current role: '${req.user.role}'.`,
    });
  };
};

/**
 * Optional authentication: attaches user if token is valid, but allows anonymous access
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token = null;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user && user.isActive) {
        req.user = user;
      }
    }
  } catch {
    // Ignore invalid/expired token in optionalAuth
    req.user = null;
  }
  next();
};
