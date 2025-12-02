import { initializeSocketRooms as settingsInit } from "./settings.js";
import { usersRoom } from "./users.js";

export const initializeSocketRooms = (io: any) => {
  settingsInit(io);
  usersRoom.initialize(io);
};
