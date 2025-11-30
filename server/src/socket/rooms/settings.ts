import getAllSettings from "../../db/settings.js";
import { GSK_APP_VAR_SETTINGS_TRANSFER } from "../../services/library/types/data-transfer/settings.js";
import { logIfVerbose } from "../../services/utils/logging.js";

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

  const payload: GSK_APP_VAR_SETTINGS_TRANSFER = {
    id: "GSK_APP_VAR_SETTINGS_TRANSFER",
    payload: allSettings,
  };
  if (socket) {
    socket.emit("GSK_APP_VAR_SETTINGS_TRANSFER", payload);
  } else if (io) {
    io.to("settings").emit("GSK_APP_VAR_SETTINGS_TRANSFER", payload);
  } else {
    console.error("Socket.io instance is not initialized.");
  }
};
