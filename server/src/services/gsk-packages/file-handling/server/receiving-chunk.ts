import { Socket } from "socket.io";
import fs from "fs/promises";
import { GSK_PKG_FL_ST_DB_SERVER_INFO } from "../types/structure.js";
import {
  GSK_PKG_FL_DT_FAILED,
  GSK_PKG_FL_DT_TRANSFER_CHUNK,
  GSK_PKG_FL_DT_TRANSFER_COMPLETE,
} from "../types/data-transfer.js";
import { logger } from "../../../../services/utils/logging.js";

export const receivingChunk = (
  socket: Socket,
  info: GSK_PKG_FL_ST_DB_SERVER_INFO
) => {
  socket.on(
    "GSK_PKG_FL_DT_TRANSFER_CHUNK",
    async (data: GSK_PKG_FL_DT_TRANSFER_CHUNK) => {
      try {
        // strore the chunk data to the file with name `{fileId}_chunk_{chunkIndex}`
        const record = info.transfersInProgress.find(
          (rec) => rec.fileId === data.payload.chunk.fileId
        );
        if (record) {
          const fileId = data.payload.chunk.fileId;
          const fileLocation =
            record.localStoragePath +
            `/${fileId}_chunk_${data.payload.chunk.chunkIndex}`;
          const chunkIndex = data.payload.chunk.chunkIndex;
          const chunkData = data.payload.chunk.data;
          fs.writeFile(fileLocation, Buffer.from(chunkData));

          // update the record
          record.chunksCompleted.push(chunkIndex);
          record.remainingChunks = record.remainingChunks.filter(
            (idx) => idx !== chunkIndex
          );

          // send ack to client
          const emitChunkAck: GSK_PKG_FL_DT_TRANSFER_COMPLETE = {
            id: "GSK_PKG_FL_DT_FILE_TRANSFER_COMPLETE",
            payload: {
              fileId: record.fileId,
            },
          };
          socket.emit("GSK_PKG_FL_DT_TRANSFER_COMPLETE", emitChunkAck);

          // check if upload is complete
          if (record.chunksCompleted.length === record.totalNumberOfChunks) {
            // join all chunks to form the final file
            // Make sure the RAM is not overloaded for large files
            const finalFileName = record.localStoragePath + `/${fileId}`; // An empty file is created during upload init
            const writeStream = await fs.open(finalFileName, "w");
            // Make sure the file is empty
            await writeStream.truncate(0);
            for (let i = 0; i < record.totalNumberOfChunks; i++) {
              const chunkFileName =
                record.localStoragePath + `/${fileId}_chunk_${i}`;
              const chunkData = await fs.readFile(chunkFileName);
              await writeStream.write(chunkData);
              // delete the chunk file after writing
              await fs.unlink(chunkFileName);
            }
            await writeStream.close();
            record.isComplete = true;
            // emiting GSK_PKG_FL_DT_TRANSFER_COMPLETE event to client
            const transferCompleteEmit: GSK_PKG_FL_DT_TRANSFER_COMPLETE = {
              id: "GSK_PKG_FL_DT_FILE_TRANSFER_COMPLETE",
              payload: {
                fileId: record.fileId,
              },
            };
            socket.emit(
              "GSK_PKG_FL_DT_TRANSFER_COMPLETE",
              transferCompleteEmit
            );
          }
        } else {
          const output: GSK_PKG_FL_DT_FAILED = {
            id: "GSK_PKG_FL_DT_FILE_TRANSFER_FAILED",
            payload: {
              errorMessage: `No upload record found for fileId: ${data.payload.chunk.fileId}`,
            },
          };
          socket.emit("GSK_PKG_FL_DT_FILE_TRANSFER_FAILED", output);
          logger.critical(
            `No upload record found for fileId: ${data.payload.chunk.fileId}`
          );
        }
      } catch (error) {
        const output: GSK_PKG_FL_DT_FAILED = {
          id: "GSK_PKG_FL_DT_FILE_TRANSFER_FAILED",
          payload: {
            errorMessage: (error as Error).message,
          },
        };
        socket.emit("GSK_PKG_FL_DT_FILE_TRANSFER_FAILED", output);
        logger.critical(`Receiving chunk failed: ${(error as Error).message}`);
      }
    }
  );
};
