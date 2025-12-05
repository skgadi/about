import { GSK_PKG_FL_ST_DB_INFO_SERVER } from "../types/structure.js";

export const socketDisconnected = (
  info: GSK_PKG_FL_ST_DB_INFO_SERVER,
  socketId: string
) => {
  // Clean up any transfers associated with the disconnected socket
  info.transfersInProgress = info.transfersInProgress.filter(
    (record) => record.socketId !== socketId
  );
  // Also clean up socketUploads and socketDownloads
  info.socketUploads = info.socketUploads.filter(
    (entry) => entry.socketId !== socketId
  );
  info.socketDownloads = info.socketDownloads.filter(
    (entry) => entry.socketId !== socketId
  );
};
