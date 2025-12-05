import { GSK_PKG_FL_DT_REQUEST_CHUNK } from "../types/data-transfer.js";
import {
  GSK_PKG_FL_ST_CHUNK_INFO,
  GSK_PKG_FL_ST_DB_INFO_SERVER,
} from "../types/structure.js";

export const uploadLoop = (info: GSK_PKG_FL_ST_DB_INFO_SERVER) => {
  // Request the next chunk for each upload in progress if it is under the limits.
  const chunksToRequest: {
    socketId: string;
    chunk: GSK_PKG_FL_ST_CHUNK_INFO;
  }[] = [];
  let transferIdx = 0;
  while (true) {
    // the next available chunk to request
    const transfer = info.transfersInProgress[transferIdx];
    if (!transfer) {
      break; // No more transfers
    }

    if (transfer.remainingChunks.length === 0) {
      // This transfer is complete or has no more chunks to request
      transferIdx++;
      continue;
    }

    const clientSocket = transfer.socketId;
    const numberOfActiveUploadsForClient = info.socketUploads.filter(
      (su) => su.socketId === clientSocket
    ).length;
    if (
      !clientSocket ||
      numberOfActiveUploadsForClient >= info.limits.concurrentUploadsPerClient
    ) {
      // Cannot request more chunks for this client at this time
      transferIdx++;
      continue;
    }

    const numberOfActiveUploadsForFile = info.socketUploads.filter(
      (su) => su.fileId === transfer.fileId
    ).length;
    if (numberOfActiveUploadsForFile >= info.limits.concurrentUploadsPerFile) {
      // Cannot request more chunks for this file at this time
      transferIdx++;
      continue;
    }

    // Request the next chunk
    const isThisLastChunk = transfer.remainingChunks.length === 1;
    const chunk: GSK_PKG_FL_ST_CHUNK_INFO = {
      chunkIndex: transfer.remainingChunks.shift()!,
      fileId: transfer.fileId,
      chunkSizeInBytes: isThisLastChunk
        ? transfer.lastChunkSizeInBytes
        : transfer.standardChunkSizeInBytes,
      totalNumberOfChunks: transfer.totalNumberOfChunks,
      standardChunkSizeInBytes: transfer.standardChunkSizeInBytes,
      lastChunkSizeInBytes: transfer.lastChunkSizeInBytes,
    };
    chunksToRequest.push({ socketId: transfer.socketId, chunk });

    if (isThisLastChunk) {
      // All chunks have been requested for this transfer
      transferIdx++;
    }
    if (chunksToRequest.length >= info.limits.totalUploads) {
      break; // Reached the total uploads limit
    }
  }

  // Emit chunk requests
  for (const request of chunksToRequest) {
    const emitRequestChunk: GSK_PKG_FL_DT_REQUEST_CHUNK = {
      id: "GSK_PKG_FL_DT_REQUEST_CHUNK",
      payload: {
        chunkInfo: request.chunk,
      },
    };
    info.io
      .to(request.socketId)
      .emit("GSK_PKG_FL_DT_REQUEST_CHUNK", emitRequestChunk);
  }
};
