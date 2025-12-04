import type {
  GSK_PKG_FL_ST_CHUNK,
  GSK_PKG_FL_ST_CHUNK_INFO,
  GSK_PKG_FL_ST_DOWNLOAD_INIT,
  GSK_PKG_FL_ST_UL_DL_RESPONSE,
  GSK_PKG_FL_ST_UPLOAD_INIT,
} from "./structure.js";

export interface GSK_PKG_FL_DT_UPLOAD_INIT {
  id: "GSK_PKG_FL_DT_FILE_UPLOAD_INIT";
  payload: {
    fileInfo: GSK_PKG_FL_ST_UPLOAD_INIT;
  };
}

export interface GSK_PKG_FL_DT_UPLOAD_ACK {
  id: "GSK_PKG_FL_DT_FILE_UPLOAD_ACK";
  payload: {
    fileInfo: GSK_PKG_FL_ST_UL_DL_RESPONSE;
  };
}

export interface GSK_PKG_FL_DT_DOWNLOAD_INIT {
  id: "GSK_PKG_FL_DT_FILE_DOWNLOAD_INIT";
  payload: {
    fileInfo: GSK_PKG_FL_ST_DOWNLOAD_INIT;
  };
}

export interface GSK_PKG_FL_ST_DOWNLOAD_ACK {
  id: "GSK_PKG_FL_DT_FILE_DOWNLOAD_ACK";
  payload: {
    fileInfo: GSK_PKG_FL_ST_UL_DL_RESPONSE;
  };
}

export interface GSK_PKG_FL_DT_REQUEST_CHUNK {
  id: "GSK_PKG_FL_DT_REQUEST_FILE_CHUNK";
  payload: {
    chunkInfo: GSK_PKG_FL_ST_CHUNK_INFO;
  };
}

export interface GSK_PKG_FL_DT_TRANSFER_CHUNK {
  id: "GSK_PKG_FL_DT_FILE_CHUNK_TRANSFER";
  payload: {
    chunk: GSK_PKG_FL_ST_CHUNK;
  };
}

//export type GSK_PKG_FL_DT_TRANSFER_CHUNK_SC = GSK_PKG_FL_DT_TRANSFER_CHUNK; // Same structure for server to client chunk transfer
//export type GSK_PKG_FL_DT_TRANSFER_CHUNK_CS = GSK_PKG_FL_DT_TRANSFER_CHUNK; // Same structure for client to server chunk transfer

export interface GSK_PKG_FL_DT_TRANSFER_COMPLETE {
  id: "GSK_PKG_FL_DT_FILE_TRANSFER_COMPLETE";
  payload: {
    fileId: string;
  };
}

export interface GSK_PKG_FL_DT_CANCEL_TRANSFER {
  id: "GSK_PKG_FL_DT_CANCEL_TRANSFER";
  payload: {
    fileId: string;
    reason?: string;
  };
}

export interface GSK_PKG_FL_DT_CANCEL_ACK {
  id: "GSK_PKG_FL_DT_CANCEL_ACK";
  payload: {
    fileId: string;
  };
}

export type GSK_PKG_FL_DT_FAILED = {
  id: "GSK_PKG_FL_DT_FILE_TRANSFER_FAILED";
  payload: {
    errorMessage: string;
  };
};
