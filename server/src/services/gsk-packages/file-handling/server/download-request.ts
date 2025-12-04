import fs from "fs/promises";
import { Socket } from "socket.io";
import { GSK_PKG_FL_ST_DB_SERVER_INFO } from "../types/structure.js";
import {
  GSK_PKG_FL_DT_DOWNLOAD_INIT,
  GSK_PKG_FL_DT_FAILED,
  GSK_PKG_FL_ST_DOWNLOAD_ACK,
} from "../types/data-transfer.js";
import { logger } from "../../../../services/utils/logging.js";
import { getChunkMeta } from "../utils/chunk-size.js";

export const downloadRequest = (
  socket: Socket,
  info: GSK_PKG_FL_ST_DB_SERVER_INFO
) => {
  socket.on(
    "GSK_PKG_FL_DT_DOWNLOAD_INIT",
    async (data: GSK_PKG_FL_DT_DOWNLOAD_INIT) => {
      try {
        const { fileId, folderPath } = data.payload.fileInfo;
        // check if the file exists in the folder
        const originalFileLocation = `${folderPath}/${fileId}`;
        try {
          await fs.access(originalFileLocation);
        } catch (err) {
          const output: GSK_PKG_FL_DT_FAILED = {
            id: "GSK_PKG_FL_DT_FILE_TRANSFER_FAILED",
            payload: {
              errorMessage: `File with fileId: ${fileId} does not exist on server.`,
            },
          };
          socket.emit("GSK_PKG_FL_DT_FILE_TRANSFER_FAILED", output);
          return;
        }

        // new file location in the temp storage path
        const tempFileLocation = `${info.tempStoragePath}/${fileId}`;
        // copy the file to temp storage path
        await fs.copyFile(originalFileLocation, tempFileLocation);

        const stats = await fs.stat(tempFileLocation);
        const fileSizeInBytes = stats.size;
        const chunkSizeInBytes = info.maxChunkSizeBytes;
        const chunkMeta = getChunkMeta(fileSizeInBytes, chunkSizeInBytes);

        const output: GSK_PKG_FL_ST_DOWNLOAD_ACK = {
          id: "GSK_PKG_FL_DT_FILE_DOWNLOAD_ACK",
          payload: {
            fileInfo: {
              fileId,
              ...chunkMeta,
            },
          },
        };

        socket.emit("GSK_PKG_FL_DT_FILE_DOWNLOAD_ACK", output);
      } catch (error) {
        const output: GSK_PKG_FL_DT_FAILED = {
          id: "GSK_PKG_FL_DT_FILE_TRANSFER_FAILED",
          payload: {
            errorMessage: (error as Error).message,
          },
        };
        socket.emit("GSK_PKG_FL_DT_FILE_TRANSFER_FAILED", output);
        logger.critical(`Download request failed: ${(error as Error).message}`);
      }
    }
  );
};
