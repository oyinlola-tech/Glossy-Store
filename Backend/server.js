require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const { app, initializeDatabase } = require('./src/app');
const { setupSupportSocket } = require('./src/socket/supportSocket');

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
  try {
    await initializeDatabase();
    const server = http.createServer(app);
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
  } catch (err) {
    console.error('Server startup failed:', err);
    process.exit(1);
  }
};

startServer();
