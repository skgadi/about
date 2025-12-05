import fs from "fs/promises";
import { Socket } from "socket.io";
import { GSK_PKG_FL_ST_DB_INFO_SERVER } from "../types/structure.js";
import {
  GSK_PKG_FL_DT_CANCEL_ACK,
  GSK_PKG_FL_DT_CANCEL_TRANSFER,
  GSK_PKG_FL_DT_FAILED,
} from "../types/data-transfer.js";
import { logger } from "../../../../services/utils/logging.js";

export const cancelTransfer = (
  socket: Socket,
  info: GSK_PKG_FL_ST_DB_INFO_SERVER
) => {
  socket.on(
    "GSK_PKG_FL_DT_CANCEL_TRANSFER",
    async (data: GSK_PKG_FL_DT_CANCEL_TRANSFER) => {
      try {
        console.log(`Cancelling transfer for fileId: ${data.payload.fileId}`);
        const fileId = data.payload.fileId;
        // find the record
        const recordIndex = info.transfersInProgress.findIndex(
          (rec) => rec.fileId === fileId
        );
        if (recordIndex === -1) {
          // no such transfer in progress
          const output: GSK_PKG_FL_DT_FAILED = {
            id: "GSK_PKG_FL_DT_FAILED",
            payload: {
              error: "transfer-cancelled",
              errorMessage: `No transfer in progress for fileId: ${fileId}`,
            },
          };
          socket.emit("GSK_PKG_FL_DT_FAILED", output);
          return;
        }

        // remove all the chunk files
        const record = info.transfersInProgress[recordIndex];
        record.chunksCompleted.forEach(async (chunkIndex) => {
          const chunkFileName =
            record.localStoragePath + `_chunk_${chunkIndex}`;
          try {
            await fs.unlink(chunkFileName);
          } catch (err) {
            // ignore errors
            console.log(`Error deleting chunk file ${chunkFileName}: ${err}`);
          }
        });

        // remove the main file
        try {
          await fs.unlink(record.localStoragePath);
        } catch (err) {
          // ignore errors
          console.log(
            `Error deleting main file ${record.localStoragePath}: ${err}`
          );
        }

        // remove the record from transfersInProgress
        info.transfersInProgress.splice(recordIndex, 1);

        // send cancel ack to client
        const output: GSK_PKG_FL_DT_CANCEL_ACK = {
          id: "GSK_PKG_FL_DT_CANCEL_ACK",
          payload: {
            fileId,
          },
        };
        socket.emit("GSK_PKG_FL_DT_CANCEL_ACK", output);
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
          `Error in cancel-transfer routine: ${(error as Error).message}`
        );
      }
    }
  );
};
