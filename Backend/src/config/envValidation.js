const REQUIRED_PROD_KEYS = [
  'DB_HOST',
  'DB_PORT',
  'DB_USER',
  'DB_NAME',
  'JWT_SECRET',
  'SQUAD_SECRET_KEY',
  'ATTACHMENT_URL_SECRET',
];

const OPTIONAL_WARN_KEYS = [
  'OTP_HASH_SECRET',
  'PAYMENT_TOKEN_SECRET',
  'SQUAD_WEBHOOK_SECRET',
  'SQUAD_CALLBACK_URL',
  'CORS_ALLOWED_ORIGINS',
];

const hasValue = (key) => String(process.env[key] || '').trim().length > 0;

const validateEnvironment = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const issues = [];

  if (isProduction) {
    for (const key of REQUIRED_PROD_KEYS) {
      if (!hasValue(key)) {
        issues.push(`Missing required environment variable: ${key}`);
      }
    }
  }

  const jwtSecret = String(process.env.JWT_SECRET || '');
  if (isProduction) {
    if (jwtSecret && jwtSecret.length < 32) {
      issues.push('JWT_SECRET must be at least 32 characters');
    }
  } else if (jwtSecret && jwtSecret.length < 32) {
    console.warn('[env] JWT_SECRET should be at least 32 characters');
  }

  const dbPort = Number(process.env.DB_PORT || 3306);
  if (!Number.isInteger(dbPort) || dbPort <= 0 || dbPort > 65535) {
    issues.push('DB_PORT must be a valid TCP port (1-65535)');
  }

  const allowedOrigins = String(process.env.CORS_ALLOWED_ORIGINS || '').trim();
  if (isProduction && !allowedOrigins) {
    issues.push('CORS_ALLOWED_ORIGINS is required in production');
  }

  const paymentTokenSecret = String(process.env.PAYMENT_TOKEN_SECRET || '');
  if (isProduction && paymentTokenSecret.length < 32) {
    issues.push('PAYMENT_TOKEN_SECRET must be at least 32 characters in production');
  }

  const otpHashSecret = String(process.env.OTP_HASH_SECRET || '');
  if (isProduction && otpHashSecret.length < 32) {
    issues.push('OTP_HASH_SECRET must be at least 32 characters in production');
  }

  const attachmentSecret = String(process.env.ATTACHMENT_URL_SECRET || '');
  if (isProduction && attachmentSecret.length < 32) {
    issues.push('ATTACHMENT_URL_SECRET must be at least 32 characters in production');
  }

  if (issues.length) {
    const err = new Error(`Environment validation failed:\n- ${issues.join('\n- ')}`);
    err.statusCode = 500;
    throw err;
  }

  if (!isProduction) {
    for (const key of OPTIONAL_WARN_KEYS) {
      if (!hasValue(key)) {
        console.warn(`[env] ${key} is not set`);
      }
    }
  }
};

module.exports = { validateEnvironment };
