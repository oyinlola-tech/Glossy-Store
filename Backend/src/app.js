const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const rateLimit = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');
const routes = require('./routes');
const sequelize = require('./config/database');
const passport = require('./config/passport');
const { mountSwagger } = require('./config/swagger');
const { createDatabaseIfNotExists } = require('./config/databaseBootstrap');
const { seedSuperAdminFromEnv } = require('./services/adminBootstrapService');
const { runMigrations } = require('./services/migrationService');
require('./models');

const app = express();
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map((v) => v.trim())
  .filter(Boolean);
const isProduction = process.env.NODE_ENV === 'production';

const corsOrigin = (origin, callback) => {
  if (!origin) return callback(null, true);
  if (!isProduction && allowedOrigins.length === 0) return callback(null, true);
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
app.use(rateLimit);
app.use(passport.initialize());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'glossy-store-backend' });
});

app.get('/api/info', (req, res) => {
  res.json({
    name: 'Glossy Store Backend',
    version: process.env.APP_VERSION ,
    environment: process.env.NODE_ENV,
    owner: process.env.APP_OWNER ,
    portfolio: process.env.APP_PORTFOLIO ,
    docs_url: '/api/docs',
  });
});

// Routes
app.use('/api', routes);
mountSwagger(app);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling
app.use(errorHandler);

const initializeDatabase = async () => {
  await createDatabaseIfNotExists();
  await sequelize.authenticate();
  const autoSync = String(process.env.AUTO_SYNC_MODELS || 'true').toLowerCase() === 'true';
  if (autoSync) {
    await sequelize.sync();
  }
  const autoMigrate = String(process.env.AUTO_RUN_MIGRATIONS || 'true').toLowerCase() === 'true';
  if (autoMigrate) {
    await runMigrations();
  }
  await seedSuperAdminFromEnv();
};

module.exports = { app, initializeDatabase };
