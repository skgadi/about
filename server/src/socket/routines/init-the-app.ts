import dotenv from "dotenv";
dotenv.config();
import {
  GSK_APP_GLOBAL_CONSTANT_DEFAULT_NAME,
  GSK_APP_GLOBAL_CONSTANT_VERSION,
} from "../../services/library/constants/app-init.js";
import { GSK_APP_CONST_SETTINGS_TRANSFER } from "../../services/library/types/data-transfer/settings.js";
import { GSK_STRUCTURES_CONSTANT_SETTINGS } from "services/library/types/structures/settings.js";
import { emitSettings, joinSettingsRoom } from "../rooms/settings.js";

export const routines = async (io: any, socket: any) => {
  // Handle socket events and routines here
  socket.on("GSK_APP_INIT", async () => {
    // Emit an event to the client with the app name
    const constSettings: GSK_STRUCTURES_CONSTANT_SETTINGS = {
      appName: process.env.MY_APP_NAME || GSK_APP_GLOBAL_CONSTANT_DEFAULT_NAME,
      appVersion: process.env.MY_APP_VERSION || GSK_APP_GLOBAL_CONSTANT_VERSION,
    };
    const payload: GSK_APP_CONST_SETTINGS_TRANSFER = {
      id: "GSK_APP_CONST_SETTINGS_TRANSFER",
      payload: constSettings,
    };
    socket.emit("GSK_APP_CONST_SETTINGS_TRANSFER", payload);
    joinSettingsRoom(socket);
    emitSettings(socket);
  });
};
