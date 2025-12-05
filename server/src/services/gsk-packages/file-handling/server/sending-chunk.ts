import fs from "fs/promises";
import { Socket } from "socket.io";
import {
  GSK_PKG_FL_ST_CHUNK_INFO,
  GSK_PKG_FL_ST_DB_INFO_SERVER,
} from "../types/structure.js";
import {
  GSK_PKG_FL_DT_FAILED,
  GSK_PKG_FL_DT_REQUEST_CHUNK,
  GSK_PKG_FL_DT_TRANSFER_CHUNK,
} from "../types/data-transfer.js";
import { logger } from "../../../../services/utils/logging.js";

export const sendingChunk = (
  socket: Socket,
  info: GSK_PKG_FL_ST_DB_INFO_SERVER
) => {
  socket.on(
    "GSK_PKG_FL_DT_REQUEST_CHUNK",
    async (data: GSK_PKG_FL_DT_REQUEST_CHUNK) => {
      try {
        const {
          chunkIndex,
          chunkSizeInBytes,
          fileId,
          totalNumberOfChunks,
          lastChunkSizeInBytes,
          standardChunkSizeInBytes,
        } = data.payload.chunkInfo;
        const fileLocation = `${info.tempStoragePath}/${fileId}`;
        // check if the file exists in the folder
        try {
          await fs.access(fileLocation);
        } catch (err) {
          const output: GSK_PKG_FL_DT_FAILED = {
            id: "GSK_PKG_FL_DT_FAILED",
            payload: {
              error: "file-not-found",
              errorMessage: `File with fileId: ${fileId} does not exist on server.`,
            },
          };
          socket.emit("GSK_PKG_FL_DT_FAILED", output);
          return;
        }

        const startByte = chunkIndex * chunkSizeInBytes;

        const buffer = Buffer.alloc(chunkSizeInBytes);
        const fileHandle = await fs.open(fileLocation, "r");
        const { bytesRead } = await fileHandle.read(
          buffer,
          0,
          chunkSizeInBytes,
          startByte
        );
        await fileHandle.close();

        const output: GSK_PKG_FL_DT_TRANSFER_CHUNK = {
          id: "GSK_PKG_FL_DT_TRANSFER_CHUNK",
          payload: {
            chunk: {
              fileId,
              chunkIndex,
              data: buffer.subarray(0, bytesRead),
              chunkSizeInBytes: bytesRead,
              totalNumberOfChunks,
              lastChunkSizeInBytes,
              standardChunkSizeInBytes,
            },
          },
        };
        socket.emit("GSK_PKG_FL_DT_FILE_CHUNK_TRANSFER", output);
      } catch (error) {
        const output: GSK_PKG_FL_DT_FAILED = {
          id: "GSK_PKG_FL_DT_FAILED",
          payload: {
            error: "internal-server-error",
            errorMessage: (error as Error).message,
          },
        };
        socket.emit("GSK_PKG_FL_DT_FAILED", output);
        logger.critical(
          `Sending chunk request failed: ${(error as Error).message}`
        );
      }
    }
  );
};

export const isAValidChunkRequest = async (
  chunkInfo: GSK_PKG_FL_ST_CHUNK_INFO,
  info: GSK_PKG_FL_ST_DB_INFO_SERVER
): Promise<boolean> => {
  // not used because it is simple enough to use try-catch in the main function
  const { chunkIndex, chunkSizeInBytes, fileId, totalNumberOfChunks } =
    chunkInfo;
  if (chunkIndex < 0 || chunkIndex >= totalNumberOfChunks) {
    return false;
  }
  if (chunkSizeInBytes <= 0) {
    return false;
  }

  // Check if file exists
  const fileLocation = `${info.tempStoragePath}/${fileId}`;
  try {
    await fs.access(fileLocation);
  } catch (err) {
    return false;
  }

  // Check if chunk size is appropriate
  const fileStats = await fs.stat(fileLocation);
  const expectedTotalChunks = Math.ceil(fileStats.size / chunkSizeInBytes);
  if (totalNumberOfChunks !== expectedTotalChunks) {
    return false;
  }

  // check if start byte and end byte are within file size
  const startByte = chunkIndex * chunkSizeInBytes;
  if (startByte >= fileStats.size) {
    return false;
  }

  const endByte = Math.min(startByte + chunkSizeInBytes, fileStats.size);
  if (endByte > fileStats.size) {
    return false;
  }

  // Further validations can be added as needed
  return true;
};
