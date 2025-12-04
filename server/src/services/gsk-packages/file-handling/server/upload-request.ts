import fs from "fs/promises";
import {
  GSK_PKG_FL_DT_FAILED,
  GSK_PKG_FL_DT_UPLOAD_ACK,
  GSK_PKG_FL_DT_UPLOAD_INIT,
} from "../types/data-transfer.js";
import {
  GSK_PKG_FL_ST_FILE_CHUNK_META,
  GSK_PKG_FL_ST_DB_RECORD,
  GSK_PKG_FL_ST_DB_SERVER_INFO,
} from "../types/structure.js";
import { v7 as uuidv7 } from "uuid";
import { Socket } from "socket.io";
import { logger } from "../../../../services/utils/logging.js";
import { getChunkMeta } from "../utils/chunk-size.js";

export const uploadRequest = (
  socket: Socket,
  info: GSK_PKG_FL_ST_DB_SERVER_INFO
) => {
  socket.on(
    "GSK_PKG_FL_DT_UPLOAD_INIT",
    async (data: GSK_PKG_FL_DT_UPLOAD_INIT) => {
      try {
        const fileId = uuidv7();
        const localStoragePath = `${info.tempStoragePath}/${fileId}`;
        await fs.writeFile(localStoragePath, "");
        await fs.writeFile(localStoragePath, ""); // Create empty file
        const chunkMeta = getChunkMeta(
          data.payload.fileInfo.sizeInBytes,
          info.maxChunkSizeBytes
        );
        /*const chunkInfo: GSK_PKG_FL_ST_FILE_CHUNK_META = {
          standardChunkSizeInBytes: info.maxChunkSizeBytes,
          totalNumberOfChunks: Math.ceil(
            data.payload.fileInfo.sizeInBytes / info.maxChunkSizeBytes
          ),
          lastChunkSizeInBytes:
            data.payload.fileInfo.sizeInBytes % info.maxChunkSizeBytes ||
            info.maxChunkSizeBytes,
        };*/

        const newRecod: GSK_PKG_FL_ST_DB_RECORD = {
          ...data.payload.fileInfo,
          ...chunkMeta,
          fileId,
          localStoragePath,
          chunksCompleted: [],
          remainingChunks: Array.from(
            { length: chunkMeta.totalNumberOfChunks },
            (_, i) => i
          ),
          isComplete: false,
        };
        info.transfersInProgress.push(newRecod);

        const output: GSK_PKG_FL_DT_UPLOAD_ACK = {
          id: "GSK_PKG_FL_DT_FILE_UPLOAD_ACK",
          payload: {
            fileInfo: {
              fileId,
              ...chunkMeta,
            },
          },
        };
        socket.emit("GSK_PKG_FL_DT_UPLOAD_ACK", output);
      } catch (error) {
        const output: GSK_PKG_FL_DT_FAILED = {
          id: "GSK_PKG_FL_DT_FILE_TRANSFER_FAILED",
          payload: {
            errorMessage: (error as Error).message,
          },
        };
        socket.emit("GSK_PKG_FL_DT_FILE_TRANSFER_FAILED", output);
        logger.critical(`Upload request failed: ${(error as Error).message}`);
      }
    }
  );
};
