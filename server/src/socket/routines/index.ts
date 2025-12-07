import { routines as initTheApp } from "./init-the-app.js";
import { routines as auth } from "./auth.js";
import { routines as documents } from "./documents.js";
import { routines as users } from "./users.js";
import { routines as userRoot } from "./user-root.js";

export const socketRoutines = async (io: any, socket: any) => {
  initTheApp(io, socket);
  auth(io, socket);
  documents(io, socket);
  users(io, socket);
  userRoot(io, socket);
};
