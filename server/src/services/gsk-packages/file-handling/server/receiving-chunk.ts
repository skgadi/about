import fs1 from "fs";
import crypto from "crypto";
import { pipeline } from "stream/promises";

import { Socket } from "socket.io";
import fs from "fs/promises";
import { GSK_PKG_FL_ST_DB_INFO_SERVER } from "../types/structure.js";
import {
  GSK_PKG_FL_DT_FAILED,
  GSK_PKG_FL_DT_TRANSFER_CHUNK,
  GSK_PKG_FL_DT_TRANSFER_COMPLETE,
} from "../types/data-transfer.js";
import { logger } from "../../../../services/utils/logging.js";

export const receivingChunk = (
  socket: Socket,
  info: GSK_PKG_FL_ST_DB_INFO_SERVER
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
            record.localStoragePath + `_chunk_${data.payload.chunk.chunkIndex}`;
          const chunkIndex = data.payload.chunk.chunkIndex;
          const chunkData = data.payload.chunk.data;
          const rawBuffer = toBufferMaybe(chunkData);
          // if file exists, replace it
          await fs.writeFile(fileLocation, rawBuffer);

          // update the record
          record.chunksCompleted.push(chunkIndex);

          // Since data is removed. It is considered as this chunk upload is finished. So, remove from info.socketUploads
          info.socketUploads = info.socketUploads.filter(
            (su) =>
              !(
                su.socketId === socket.id &&
                su.fileId === fileId &&
                su.chunkId === chunkIndex
              )
          );

          // check if upload is complete
          if (record.chunksCompleted.length === record.totalNumberOfChunks) {
            // join all chunks to form the final file
            // Make sure the RAM is not overloaded for large files
            const finalFileName = record.localStoragePath; // An empty file is created during upload init
            const writeStream = await fs.open(finalFileName, "w");
            // Make sure the file is empty
            await writeStream.truncate(0);
            await writeStream.close();

            const finalStream = fs1.createWriteStream(finalFileName);

            for (let i = 0; i < record.totalNumberOfChunks; i++) {
              const chunkFileName = record.localStoragePath + `_chunk_${i}`;
              const data = await fs.readFile(chunkFileName); // chunk is small
              finalStream.write(data);
            }

            finalStream.end();

            // check the checksum is correct
            const hex = await getFileChecksumWithAwait(finalFileName, "sha512");
            logger.critical(
              `Calculated checksum for fileId: ${fileId} is ${hex}`
            );
            if (hex !== record.sha512Hash) {
              failedReceivingChunkResponse(
                `Checksum mismatch for fileId: ${fileId}`,
                "invalid-chunk-request",
                data,
                socket,
                info
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

            // cleanup chunk files
            for (let i = 0; i < record.totalNumberOfChunks; i++) {
              const chunkFileName = record.localStoragePath + `_chunk_${i}`;
              await fs.unlink(chunkFileName);
            }
          }
        } else {
          failedReceivingChunkResponse(
            `No upload record found for fileId: ${data.payload.chunk.fileId}`,
            "invalid-chunk-request",
            data,
            socket,
            info
          );
        }
      } catch (error) {
        failedReceivingChunkResponse(
          (error as Error).message,
          "internal-server-error",
          data,
          socket,
          info
        );
      }
    }
  );
};

const failedReceivingChunkResponse = (
  reason: string,
  error: GSK_PKG_FL_DT_FAILED["payload"]["error"],

  chunkData: GSK_PKG_FL_DT_TRANSFER_CHUNK,
  socket: Socket,
  info: GSK_PKG_FL_ST_DB_INFO_SERVER
) => {
  const payloadToClient: GSK_PKG_FL_DT_FAILED = {
    id: "GSK_PKG_FL_DT_FAILED",
    payload: {
      error: error,
      errorMessage: reason,
    },
  };

  // remove the chunk file if exists
  const tempChunkFilePath =
    info.transfersInProgress.find(
      (el) => el.fileId === chunkData.payload.chunk.fileId
    )?.localStoragePath + `_chunk_${chunkData.payload.chunk.chunkIndex}`;
  if (tempChunkFilePath) {
    fs.unlink(tempChunkFilePath).catch(() => {
      // ignore errors
    });
  }

  const associatedElement = info.transfersInProgress.find(
    (el) => el.fileId === chunkData.payload.chunk.fileId
  );
  if (!associatedElement) {
    payloadToClient.payload.error = "file-not-found";
    socket.emit("GSK_PKG_FL_DT_FAILED", payloadToClient);
    logger.moderate(
      `No upload record found for fileId: ${chunkData.payload.chunk.fileId}`
    );
    return;
  }

  // Re-add the chunk index back to remainingChunks for re-transfer (if it is not found there)
  if (
    !associatedElement.remainingChunks.includes(
      chunkData.payload.chunk.chunkIndex
    )
  ) {
    associatedElement.remainingChunks.push(chunkData.payload.chunk.chunkIndex);
  }

  // remove from chunksCompleted
  associatedElement.chunksCompleted = associatedElement.chunksCompleted.filter(
    (idx) => idx !== chunkData.payload.chunk.chunkIndex
  );

  socket.emit("GSK_PKG_FL_DT_FAILED", payloadToClient);
  logger.critical(
    `Failed chunk transfer for fileId: ${chunkData.payload.chunk.fileId}, reason: ${reason}`
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

function toBufferMaybe(input: any): Buffer {
  // Buffer: return as is
  if (Buffer.isBuffer(input)) return input;

  // ArrayBuffer
  if (input instanceof ArrayBuffer) return Buffer.from(input);

  // TypedArray / DataView
  if (ArrayBuffer.isView(input)) {
    // covers Uint8Array, Int8Array, DataView, etc.
    return Buffer.from(input.buffer, input.byteOffset, input.byteLength);
  }

  // socket.io sometimes gives { type: 'Buffer', data: [1,2,3,...] }
  if (input && Array.isArray(input.data)) return Buffer.from(input.data);

  // Last resort: if it's an array-like of numbers
  if (Array.isArray(input)) return Buffer.from(input);

  throw new TypeError("Unsupported chunk data format for conversion to Buffer");
}
