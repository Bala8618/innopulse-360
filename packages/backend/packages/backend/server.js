const app = require('./app');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true
    }
  });

  app.locals.io = io;

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Assume user id is sent on connection, e.g., socket.handshake.query.userId
    const userId = socket.handshake.query.userId;
    if (userId) {
      socket.join(userId);
    }

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });

    // Add more socket events here
  });

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
