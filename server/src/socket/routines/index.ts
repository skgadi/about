import { routines as initTheApp } from "./init-the-app.js";
import { routines as auth } from "./auth.js";
import { routines as documents } from "./documents.js";

export const socketRoutines = async (io: any, socket: any) => {
  initTheApp(io, socket);
  auth(io, socket);
  documents(io, socket);
};
