const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const rateLimit = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');
const sanitizeInput = require('./middleware/sanitizeInput');
const routes = require('./routes');
const sequelize = require('./config/database');
const passport = require('./config/passport');
const { mountSwagger } = require('./config/swagger');
const { createDatabaseIfNotExists } = require('./config/databaseBootstrap');
const { seedSuperAdminFromEnv } = require('./services/adminBootstrapService');
const { runMigrations } = require('./services/migrationService');
require('./models');

const app = express();
const uploadDir = path.resolve(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map((v) => v.trim())
  .filter(Boolean);
const isProduction = process.env.NODE_ENV === 'production';

const parseBooleanEnv = (value, defaultValue = false) => {
  const raw = String(value ?? '').trim().toLowerCase();
  if (!raw) return defaultValue;
  return ['1', 'true', 'yes', 'on'].includes(raw);
};

const normalizeTableName = (entry) => {
  if (typeof entry === 'string') return entry;
  if (entry && typeof entry === 'object') {
    const values = Object.values(entry);
    if (values.length > 0) return String(values[0]);
  }
  return '';
};

const isDevLocalhost = (origin) => {
  if (!origin) return false;
  return /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
};

const corsOrigin = (origin, callback) => {
  if (!origin) return callback(null, true);
  if (!isProduction && (allowedOrigins.length === 0 || isDevLocalhost(origin))) {
    return callback(null, true);
  }
  if (allowedOrigins.includes(origin)) return callback(null, true);
  return callback(new Error('Origin not allowed by CORS'));
};

const trustProxy = (() => {
  const raw = String(process.env.TRUST_PROXY || '').trim();
  if (!raw) return false;
  if (/^\d+$/.test(raw)) return Number(raw);
  return raw.toLowerCase() === 'true';
})();

// Middleware
app.use(helmet({
  hsts: isProduction ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
  contentSecurityPolicy: isProduction ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  } : false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  referrerPolicy: { policy: 'no-referrer' },
}));
app.set('trust proxy', trustProxy);
app.disable('x-powered-by');
app.use(cors({
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type', 'X-Requested-With'],
}));
app.use(requestLogger);
app.use(express.json({
  limit: process.env.JSON_BODY_LIMIT || '1mb',
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  },
}));
app.use(express.urlencoded({ extended: true, limit: process.env.JSON_BODY_LIMIT || '1mb' }));
app.use(sanitizeInput);
app.use(rateLimit);
app.use(passport.initialize());
app.use('/uploads', express.static(uploadDir, { fallthrough: false }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'glossy-store-backend' });
});

app.get('/api/info', (req, res) => {
  res.json({
    name: 'Glossy Store Backend',
    version: process.env.APP_VERSION || 'unknown',
    environment: process.env.NODE_ENV || 'development',
    owner: process.env.APP_OWNER || null,
    portfolio: process.env.APP_PORTFOLIO || null,
    docs_url: '/api/docs',
  });
});

// Routes
app.use('/api', routes);
mountSwagger(app);

app.use((err, req, res, next) => {
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }
  return next(err);
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling
app.use(errorHandler);

const initializeDatabase = async () => {
  await createDatabaseIfNotExists();
  await sequelize.authenticate();

  const queryInterface = sequelize.getQueryInterface();
  const existingTablesRaw = await queryInterface.showAllTables();
  const existingTables = new Set(
    existingTablesRaw
      .map((entry) => normalizeTableName(entry).toLowerCase())
      .filter(Boolean)
  );

  const shouldBootstrapSchema = existingTables.size === 0 || !existingTables.has('users');
  if (shouldBootstrapSchema) {
    await sequelize.sync();
  }

  const autoSync = parseBooleanEnv(process.env.AUTO_SYNC_MODELS, false);
  if (autoSync) {
    const autoSyncAlter = parseBooleanEnv(process.env.AUTO_SYNC_ALTER, !isProduction);
    await sequelize.sync({ alter: autoSyncAlter });
  }

  const autoMigrate = parseBooleanEnv(process.env.AUTO_RUN_MIGRATIONS, !isProduction);
  if (autoMigrate) {
    await runMigrations();
  }

  await seedSuperAdminFromEnv();
};

module.exports = { app, initializeDatabase };
