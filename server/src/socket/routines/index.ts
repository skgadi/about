import { routines as initTheApp } from "./init-the-app.js";
import { routines as auth } from "./auth.js";

export const socketRoutines = async (io: any, socket: any) => {
  await initTheApp(io, socket);
  await auth(io, socket);
};
