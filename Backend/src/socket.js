import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // allow all or restrict to frontend URL
      methods: ["GET", "POST"]
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication error"));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}, User: ${socket.user.id}`);

    // If student, join their batch room automatically if they have one
    if (socket.user.role === "STUDENT" && socket.user.batchId) {
      socket.join(`batch_${socket.user.batchId}`);
      console.log(`Student ${socket.user.id} joined room batch_${socket.user.batchId}`);
    }

    socket.on("join_batch", (batchId) => {
      socket.join(`batch_${batchId}`);
      console.log(`User ${socket.user.id} joined room batch_${batchId}`);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIo = () => {
  if (!io) {
    console.error("Socket.io is not initialized!");
  }
  return io;
};
