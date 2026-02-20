require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const { app, initializeDatabase } = require('./src/app');
const { setupSupportSocket } = require('./src/socket/supportSocket');
const { validateEnvironment } = require('./src/config/envValidation');
const { scheduleWeeklyMarketingEmails } = require('./src/services/marketingEmailService');
const { ensureAllProductSlugs } = require('./src/services/productSlugService');
const { runMigrations } = require('./src/services/migrationService');

const DEFAULT_PORT = Number(process.env.PORT || 5000);
const MAX_PORT_RETRIES = Number(process.env.PORT_RETRY_COUNT || 20);
const allowedSocketOrigins = (process.env.SOCKET_CORS_ORIGIN || process.env.CORS_ALLOWED_ORIGINS || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);
const isProduction = process.env.NODE_ENV === 'production';

const socketCorsOrigin = (origin, callback) => {
  if (!origin) return callback(null, true);
  if (!isProduction && allowedSocketOrigins.length === 0) return callback(null, true);
  if (allowedSocketOrigins.includes(origin)) return callback(null, true);
  return callback(new Error('Origin not allowed'));
};

const startListeningWithRetry = (server, preferredPort, retries) => new Promise((resolve, reject) => {
  const tryListen = (port, remainingRetries) => {
    const onError = (error) => {
      if (error?.code === 'EADDRINUSE' && remainingRetries > 0) {
        server.removeListener('error', onError);
        return tryListen(port + 1, remainingRetries - 1);
      }
      return reject(error);
    };

    server.once('error', onError);
    server.listen(port, () => {
      server.removeListener('error', onError);
      resolve(port);
    });
  };

  tryListen(preferredPort, retries);
});

const isMissingProductSlugColumnError = (error) => {
  const errors = [error, error?.parent, error?.original].filter(Boolean);
  return errors.some((entry) => {
    const code = String(entry.code || '');
    const sqlMessage = String(entry.sqlMessage || entry.message || '').toLowerCase();
    const sql = String(entry.sql || '').toLowerCase();
    return (
      code === 'ER_BAD_FIELD_ERROR'
      && (
        sqlMessage.includes("unknown column 'slug'")
        || (sqlMessage.includes('unknown column') && sqlMessage.includes('slug'))
        || sql.includes('`slug`')
      )
    );
  });
};

const startServer = async () => {
  let server;
  try {
    validateEnvironment();
    const allowStartWithoutDb = String(process.env.ALLOW_START_WITHOUT_DB || '').toLowerCase() === 'true';
    try {
      await initializeDatabase();
      let slugResult;
      try {
        slugResult = await ensureAllProductSlugs();
      } catch (slugErr) {
        if (!isMissingProductSlugColumnError(slugErr)) throw slugErr;
        console.warn('[product-slug] Missing products.slug column detected. Running migrations and retrying.');
        await runMigrations();
        slugResult = await ensureAllProductSlugs();
      }
      const { updated } = slugResult;
      if (updated > 0) {
        console.log(`[product-slug] Backfilled ${updated} product slug(s).`);
      }
      scheduleWeeklyMarketingEmails();
    } catch (dbErr) {
      if (!allowStartWithoutDb) throw dbErr;
      console.error('Database initialization failed. Starting in limited mode:', dbErr.message);
    }
    server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: socketCorsOrigin,
        methods: ['GET', 'POST'],
      },
    });

    app.set('io', io);
    setupSupportSocket(io);

    const activePort = await startListeningWithRetry(server, DEFAULT_PORT, MAX_PORT_RETRIES);
    console.log(`Server running on port ${activePort}`);

    const gracefulShutdown = (signal) => {
      console.log(`Received ${signal}. Shutting down gracefully...`);
      server.close((closeErr) => {
        if (closeErr) {
          console.error('HTTP server shutdown error:', closeErr);
          process.exit(1);
        }
        process.exit(0);
      });
      setTimeout(() => {
        console.error('Force shutdown after timeout');
        process.exit(1);
      }, 10000).unref();
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (err) {
    console.error('Server startup failed:', err);
    process.exit(1);
  }
};

startServer();

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});
