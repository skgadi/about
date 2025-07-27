import { Server } from "socket.io";
import http from "http";
import { socketRoutines } from "./socket/routines/index.js";
import { initializeSocketRooms } from "./socket/rooms/index.js";

export const prepareSocketServer = (
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
) => {
  // This function prepares the Socket.IO server with the provided HTTP server.
  // Create a new Socket.IO server instance
  // Set maxHttpBufferSize to 1 GB to handle large file uploads
  // This is useful for applications that may need to handle large data transfers.
  const io = new Server(server, {
    maxHttpBufferSize: 1e9, // 1 GB
  });

  // Initialize socket rooms
  initializeSocketRooms(io);

  io.on("connection", (socket) => {
    console.log("A user connected");

    // Handle socket routines
    socketRoutines(io, socket);

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};
