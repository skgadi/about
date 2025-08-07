import getAllSettings from "db/settings.js";
import { GSK_APP_SETTINGS_TRANSFER } from "services/library/types/client-server-data-transfer.js";
import { logIfVerbose } from "services/utils/logging.js";

let io: any;

export const initializeSocketRooms = (inIo: any) => {
  io = inIo;
};

export const joinSettingsRoom = (socket: any) => {
  socket.join("settings");
  logIfVerbose(`Socket ${socket.id} joined settings room.`);
};

export const leaveSettingsRoom = (socket: any) => {
  socket.leave("settings");
  logIfVerbose(`Socket ${socket.id} left settings room.`);
};

export const emitSettings = (socket: any) => {
  const allSettings = getAllSettings();
  const payload: GSK_APP_SETTINGS_TRANSFER = {
    id: "GSK_APP_SETTINGS_TRANSFER",
    payload: allSettings,
  };
  if (socket) {
    socket.emit("settingsUpdate", payload);
  } else if (io) {
    io.to("settings").emit("settingsUpdate", payload);
  } else {
    console.error("Socket.io instance is not initialized.");
  }
};
