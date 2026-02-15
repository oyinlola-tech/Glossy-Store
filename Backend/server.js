require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const { app, initializeDatabase } = require('./src/app');
const { setupSupportSocket } = require('./src/socket/supportSocket');
const { validateEnvironment } = require('./src/config/envValidation');

const PORT = process.env.PORT || 5000;
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

const startServer = async () => {
  let server;
  try {
    validateEnvironment();
    const allowStartWithoutDb = String(process.env.ALLOW_START_WITHOUT_DB || '').toLowerCase() === 'true';
    try {
      await initializeDatabase();
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

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

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
