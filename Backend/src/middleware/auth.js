const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ALGORITHMS = (process.env.JWT_ALGORITHMS || 'HS256')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

const extractBearerToken = (req) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
};

const verifyJwt = (token) => {
  if (!JWT_SECRET) {
    const err = new Error('JWT secret is not configured');
    err.statusCode = 500;
    throw err;
  }
  return jwt.verify(token, JWT_SECRET, { algorithms: JWT_ALGORITHMS });
};

const authMiddleware = async (req, res, next) => {
  try {
    const token = extractBearerToken(req);
    if (!token) throw new Error();

    const decoded = verifyJwt(token);
    const user = await User.findByPk(decoded.id);
    if (!user) throw new Error();

    req.user = user;
    next();
  } catch (error) {
    if (error.statusCode === 500) {
      return res.status(500).json({ error: 'Authentication service is not configured' });
    }
    res.status(401).json({ error: 'Please authenticate' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
};

const superAdminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin' || !req.user.is_super_admin) {
    return res.status(403).json({ error: 'Access denied. Super admin only.' });
  }
  next();
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = extractBearerToken(req);
    if (!token) return next();

    const decoded = verifyJwt(token);
    const user = await User.findByPk(decoded.id);
    if (user) req.user = user;
    return next();
  } catch (error) {
    return next();
  }
};

module.exports = { authMiddleware, adminMiddleware, superAdminMiddleware, optionalAuth };
