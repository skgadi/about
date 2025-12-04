import { GSK_PKG_FL_ST_FILE_CHUNK_META } from "../types/structure.js";

export const getChunkMeta = (
  fileSize: number,
  maxChunkSize: number
): GSK_PKG_FL_ST_FILE_CHUNK_META => {
  // If fileSize is less than maxChunkSize, there will be only one chunk
  // and lastChunkSize should be equal to fileSize
  // Also maximum chunk size should be equal to fileSize in that case
  if (fileSize < maxChunkSize) {
    return {
      standardChunkSizeInBytes: fileSize,
      totalNumberOfChunks: 1,
      lastChunkSizeInBytes: fileSize,
    };
  }

  const totalChunks = Math.ceil(fileSize / maxChunkSize);
  const lastChunkSize =
    fileSize % maxChunkSize === 0 ? maxChunkSize : fileSize % maxChunkSize;
  return {
    standardChunkSizeInBytes: maxChunkSize,
    totalNumberOfChunks: totalChunks,
    lastChunkSizeInBytes: lastChunkSize,
  };
};
