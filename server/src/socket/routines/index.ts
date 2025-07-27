import { routines as initTheApp } from "./init-the-app.js";

export const socketRoutines = async (io: any, socket: any) => {
  await initTheApp(io, socket);
};
