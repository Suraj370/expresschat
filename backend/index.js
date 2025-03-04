const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
const roomUsers = new Map();
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle joining room
  socket.on('join_room', (data) => {
    const { roomId, username } = data;

    // Initialize room if it doesn't exist
    if (!roomUsers.has(roomId)) {
      roomUsers.set(roomId, new Set());
    }

    const usersInRoom = roomUsers.get(roomId);
    const isNewJoin = !usersInRoom.has(username); // Check if user is new to the room

    // Add user to the room's set
    usersInRoom.add(username);
    socket.join(roomId);

    // Only notify others if this is a new join, not a reconnection
    if (isNewJoin) {
      socket.to(roomId).emit('user_joined', `${username} has joined the room`);
      console.log(`${username} joined ${roomId} (new join)`);
    } else {
      console.log(`${username} rejoined ${roomId} (reconnection)`);
    }
  });

  // Handle chat message
  socket.on('send_message', (data) => {
    io.to(data.roomId).emit('receive_message', {
      username: data.username,
      message: data.message,
      timestamp: new Date().toLocaleTimeString()
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});