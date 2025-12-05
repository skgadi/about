import fs from "fs/promises";
import { GSK_PKG_FL_ST_DB_INFO_SERVER } from "../types/structure.js";

export const socketDisconnected = async (
  info: GSK_PKG_FL_ST_DB_INFO_SERVER,
  socketId: string
) => {
  // remove all the files being transferred by this socket
  for (let i = info.transfersInProgress.length - 1; i >= 0; i--) {
    const record = info.transfersInProgress[i];
    if (record.socketId === socketId) {
      // delete any chunk files associated with this transfer
      for (let j = 0; j < record.totalNumberOfChunks; j++) {
        const chunkFileName = record.localStoragePath + `_chunk_${j}`;
        try {
          await fs.unlink(chunkFileName);
        } catch (err) {
          // file might not exist, ignore
        }
      }
      // remove the file as well
      try {
        await fs.unlink(record.localStoragePath);
      } catch (err) {
        // file might not exist, ignore
      }
    }
  }
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
