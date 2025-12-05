import { routines as initTheApp } from "./init-the-app.js";
import { routines as auth } from "./auth.js";

export const socketRoutines = async (io: any, socket: any) => {
  initTheApp(io, socket);
  auth(io, socket);
};
