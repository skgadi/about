import express from "express";
import http from "http";

import path from "path"; // <-- Import the path module
import { fileURLToPath } from "url"; // <-- Import fileURLToPath for ES Modules

import dotenv from "dotenv";
import { prepareSocketServer } from "./main-socket.js";
import { GSK_APP_GLOBAL_CONSTANT_PORT } from "./services/library/constants/app-init.js";
dotenv.config();

/**
 * This function starts the static server with Socket.IO support.
 * It serves static files and initializes the Socket.IO server.
 */
export const startStaticServerWithSocket = () => {
  // Initialize the Express application
  const app = express();
  const server = http.createServer(app);

  // Use fileURLToPath to get the current file's directory
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Serve static files from the "public" directory
  app.use(express.static(path.join(__dirname, "..", "public")));

  app.get("/api/config", (req, res) => {
    // Determine the Socket.IO server URL dynamically.
    //
    // Use `req.headers.host` to get the host and port the client is connecting to.
    // This is the most reliable way when running behind proxies or in Docker,
    // as it reflects the external URL.
    //
    // If `req.headers.host` is not available (e.g., direct access and not properly
    // set by a proxy), you might fall back to a predefined environment variable
    // or a default.
    //
    // Ensure you use 'https' if your production environment uses SSL.
    const protocol =
      req.protocol ||
      (req.headers["x-forwarded-proto"] === "https" ? "wss" : "ws");
    const socketServerUrl = `//${req.headers.host}`;

    // Log for debugging
    console.log(
      `Frontend is requesting config. Detected Socket.IO URL: ${socketServerUrl}`
    );

    res.json({
      socketServerUrl: socketServerUrl,
    });
  });

  // Serve the main HTML file for all other routes
  app.get("/{*any}", (req, res) => {
    // Changed '{*any}' to '/*' for broader compatibility
    res.sendFile(path.join(__dirname, "..", "public", "index.html"));
  });

  // Prepare the Socket.IO server
  // This function sets up the Socket.IO server with the HTTP server
  // and initializes the necessary socket rooms and routines.
  // It also handles socket connections and disconnections.
  // The server will listen for incoming connections and manage socket events.
  prepareSocketServer(server);

  // Start the server on a specified port

  server.listen(GSK_APP_GLOBAL_CONSTANT_PORT, () => {
    console.log(`Server running on port ${GSK_APP_GLOBAL_CONSTANT_PORT}`);
  });
  console.log("Server file is running ...");
};
