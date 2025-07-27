import {
  GSK_APP_GLOBAL_CONSTANT_DEFAULT_NAME,
  GSK_APP_GLOBAL_CONSTANT_VERSION,
} from "../../services/library/constants/app-init.js";

export const routines = async (io: any, socket: any) => {
  // Handle socket events and routines here
  socket.on("GSK_APP_INIT", async () => {
    // Emit an event to the client with the app name
    socket.emit("GSK_APP_INIT_SETTINGS", {
      appName: process.env.MY_APP_NAME || GSK_APP_GLOBAL_CONSTANT_DEFAULT_NAME,
      appVersion: process.env.MY_APP_VERSION || GSK_APP_GLOBAL_CONSTANT_VERSION,
    });
  });
};
