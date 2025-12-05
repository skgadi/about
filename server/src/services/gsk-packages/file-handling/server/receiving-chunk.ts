import fs1 from "fs";
import crypto from "crypto";
import { pipeline } from "stream/promises";

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
            // check the checksum is correct
            const hex = await getFileChecksumWithAwait(finalFileName, "sha512");
            if (hex !== record.sha512Hash) {
              const output: GSK_PKG_FL_DT_FAILED = {
                id: "GSK_PKG_FL_DT_FILE_TRANSFER_FAILED",
                payload: {
                  errorMessage: `Checksum mismatch for fileId: ${fileId}`,
                },
              };
              socket.emit("GSK_PKG_FL_DT_FILE_TRANSFER_FAILED", output);
              logger.critical(
                `Checksum mismatch for fileId: ${fileId}. Expected: ${record.sha512Hash}, Got: ${hex}`
              );
              return;
            }

            // mark the record as complete
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

/**
 * Calculates the checksum of a file efficiently using streams and async/await.
 * @param {string} filePath - The path to the file.
 * @param {string} algorithm - The hashing algorithm (e.g., 'md5', 'sha256', 'sha512').
 * @returns {Promise<string>} The calculated checksum.
 */
async function getFileChecksumWithAwait(
  filePath: string,
  algorithm = "sha512"
) {
  // 1. Create the source stream (reads file chunks)
  const source = fs1.createReadStream(filePath);
  // 2. Create the destination stream (calculates the hash)
  const hash = crypto.createHash(algorithm);

  try {
    // 3. Use 'pipeline' to connect the source to the hash destination.
    // Pipeline handles errors and closing streams automatically.
    // Awaiting this promise means all data has been processed.
    await pipeline(source, hash);

    // 4. Once the pipeline completes, the hash object has the final digest.
    // We use .digest() to get the final result as a hex string.
    return hash.digest("hex");
  } catch (error) {
    // Handle any errors that occur during reading or hashing
    console.error("Error during file processing:", error);
    throw error; // Re-throw the error for the caller to handle
  }
}
