const jwt = require('jsonwebtoken');

const getSignAlgorithm = () => {
  const algorithms = String(process.env.JWT_ALGORITHMS || 'HS256')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  return algorithms[0] || 'HS256';
};

const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  const algorithm = getSignAlgorithm();
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d', algorithm }
  );
};

module.exports = { generateToken };
