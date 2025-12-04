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

export interface GSK_PKG_FL_ST_UPLOAD_INIT // Initiated by the client to start an upload
  extends GSK_PKG_FL_ST_FILE_METADATA {}

export interface GSK_PKG_FL_ST_DOWNLOAD_INIT {
  // Initiated by the client to start a download
  fileId: string; // Unique identifier for the file to be downloaded
  folderPath: string; // Path where the file is located on the server
}

export interface GSK_PKG_FL_ST_UL_DL_RESPONSE
  extends GSK_PKG_FL_ST_FILE_CHUNK_META {
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

export interface GSK_PKG_FL_ST_DB_INFO {
  tempStoragePath: string; // Path where the temporary file is stored during upload
  transfersInProgress: GSK_PKG_FL_ST_DB_RECORD[];
}

export interface GSK_PKG_FL_ST_DB_SERVER_INFO extends GSK_PKG_FL_ST_DB_INFO {
  maxChunkSizeBytes: number;
}

export interface GSK_PKG_FL_ST_CHUNK_INFO {
  fileId: string; // ID of the file this chunk belongs to
  chunkIndex: number;
  totalChunks: number;
  chunkSizeInBytes: number;
}
export interface GSK_PKG_FL_ST_CHUNK extends GSK_PKG_FL_ST_CHUNK_INFO {
  data: ArrayBuffer; // Actual binary data of the chunk
}
