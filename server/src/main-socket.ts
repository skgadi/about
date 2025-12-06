import { Server } from "socket.io";
import http from "http";
import { socketRoutines } from "./socket/routines/index.js";
import { initializeSocketRooms } from "./socket/rooms/index.js";
import { logger } from "./services/utils/logging.js";
import { init as initSocketPaylods } from "./socket/payloads/index.js";
import { gskPkgFileHandlingServerIndex } from "./services/gsk-packages/file-handling/server/index.js";
import fileFolderUtils from "./services/utils/users/files-folder.js";

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
  // initialize payload stores
  initSocketPaylods(io);

  // Initialize file upload handling

  const fileHandlingServer = new gskPkgFileHandlingServerIndex(
    io,
    fileFolderUtils.getTempUploadsRoot()
  );
  io.on("connection", (socket) => {
    logger.verbose("A user connected");

    // Handle socket routines
    socketRoutines(io, socket);

    // Setup file handling routines
    fileHandlingServer.routines(socket);

    // Handle disconnection
    socket.on("disconnect", () => {
      fileHandlingServer.socketDisconnected(socket.id);
      logger.verbose("User disconnected");
    });
  });
};
