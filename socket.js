const { Server } = require('socket.io');

let io;

function setupSocket(server) {
  io = new Server(server, {
    cors: {
      origin: '*', // 🔒 Replace with your frontend domain in production
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`📡 New client connected: ${socket.id}`);

    // ✅ Example event listener
    socket.on('joinRoom', (room) => {
      socket.join(room);
      console.log(`🔐 Socket ${socket.id} joined room: ${room}`);
    });

    // ✅ Optional: Custom broadcast example
    socket.on('broadcastEvent', (data) => {
      socket.broadcast.emit('receiveBroadcast', data);
    });

    // ✅ Clean up
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });
}

function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
}

module.exports = {
  setupSocket,
  getIO,
};
