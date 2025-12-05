import { Server } from "socket.io";

export interface GSK_PKG_FL_ST_FILE_METADATA {
  fileName: string;
  extension: string;
  sizeInBytes: number;
  sha512Hash: string;
  mimeType: string;
}

export interface GSK_PKG_FL_ST_FILE_CHUNK_META {
  totalNumberOfChunks: number;
  standardChunkSizeInBytes: number; // Size of each chunk except possibly the last one
  lastChunkSizeInBytes: number; // Size of the last chunk (which may be smaller)
}

export type GSK_PKG_FL_ST_UPLOAD_INIT = GSK_PKG_FL_ST_FILE_METADATA;

export interface GSK_PKG_FL_ST_DOWNLOAD_INIT {
  // Initiated by the client to start a download
  fileId: string; // Unique identifier for the file to be downloaded
  folderPath: string; // Path where the file is located on the server
  fileMeta: GSK_PKG_FL_ST_FILE_METADATA;
}

export interface GSK_PKG_FL_ST_UL_DL_RESPONSE
  extends GSK_PKG_FL_ST_FILE_CHUNK_META,
    GSK_PKG_FL_ST_FILE_METADATA {
  // Response from the server after initiating an upload or download
  fileId: string; // Unique identifier for the file to be uploaded
}

export interface GSK_PKG_FL_ST_DB_RECORD
  extends GSK_PKG_FL_ST_FILE_METADATA,
    GSK_PKG_FL_ST_UL_DL_RESPONSE {
  localStoragePath: string; // Path where the file is stored locally
  chunksCompleted: Array<number>; // Array of chunk indices that have been successfully uploaded
  remainingChunks: Array<number>; // Array of chunk indices that are yet to be uploaded
  isComplete: boolean;
}

export interface GSK_PKG_FL_ST_DB_RECORD_CLIENT
  extends GSK_PKG_FL_ST_DB_RECORD {
  file: File; // The actual File object being uploaded
}

export interface GSK_PKG_FL_ST_DB_RECORD_SERVER
  extends GSK_PKG_FL_ST_DB_RECORD {
  // Additional server-specific fields can be added here in the future
  socketId: string; // ID of the socket associated with this upload/download
}

export interface GSK_PKG_FL_ST_DB_INFO {
  tempStoragePath: string; // Path where the temporary file is stored during upload
  transfersInProgress: GSK_PKG_FL_ST_DB_RECORD[];
  limits: {
    totalUploads: number;
    totalDownloads: number;
  };
}

export interface GSK_PKG_FL_ST_DB_INFO_CLIENT {
  tempStoragePath: string; // Path where the temporary file is stored during upload
  transfersInProgress: GSK_PKG_FL_ST_DB_RECORD_CLIENT[];
}

export interface GSK_PKG_FL_ST_DB_INFO_SERVER extends GSK_PKG_FL_ST_DB_INFO {
  transfersInProgress: GSK_PKG_FL_ST_DB_RECORD_SERVER[];
  maxChunkSizeBytes: number;
  socketDownloads: {
    socketId: string;
    fileId: string;
    chunkId: number;
  }[];
  socketUploads: {
    socketId: string;
    fileId: string;
    chunkId: number;
  }[];
  io: Server;
  limits: {
    concurrentUploadsPerClient: number;
    concurrentDownloadsPerClient: number;
    concurrentUploadsPerFile: number;
    concurrentDownloadsPerFile: number;
    totalUploads: number;
    totalDownloads: number;
  };
}

export interface GSK_PKG_FL_ST_CHUNK_INFO
  extends GSK_PKG_FL_ST_FILE_CHUNK_META {
  fileId: string; // ID of the file this chunk belongs to
  chunkIndex: number;
  chunkSizeInBytes: number; // Actual size of this chunk
}
export interface GSK_PKG_FL_ST_CHUNK extends GSK_PKG_FL_ST_CHUNK_INFO {
  data: Uint8Array; // Actual binary data of the chunk
}
