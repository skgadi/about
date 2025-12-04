import { routines as initTheApp } from "./init-the-app.js";
import { routines as auth } from "./auth.js";
import { gskPkgFileHandlingServerIndex } from "../../services/gsk-packages/file-handling/server/index.js";
import path from "path";
import NodeSpecificUtils from "../../services/utils/node-specific.js";

export const socketRoutines = async (io: any, socket: any) => {
  initTheApp(io, socket);
  auth(io, socket);

  // Initialize file upload handling
  const tempUploadPath = path.join(
    NodeSpecificUtils.getProjectRoot(),
    "data/temp-uploads"
  );
  new gskPkgFileHandlingServerIndex(socket, tempUploadPath, 512 * 1024);
};
