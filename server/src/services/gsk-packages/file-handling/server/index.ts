import { Socket } from "socket.io";
import { GSK_PKG_FL_ST_DB_SERVER_INFO } from "../types/structure.js";
import path from "path";
import NodeSpecificUtils from "../../../utils/node-specific.js";
import fs from "fs";
import { uploadRequest } from "./upload-request.js";
import { receivingChunk } from "./receiving-chunk.js";
import { cancelTransfer } from "./cancel-transfer.js";
import { sendingChunk } from "./sending-chunk.js";
import { downloadRequest } from "./download-request.js";

const tempUploadPath = path.join(
  NodeSpecificUtils.getProjectRoot(),
  "temp-uploads"
);

export class gskPkgFileHandlingServerIndex {
  private info: GSK_PKG_FL_ST_DB_SERVER_INFO;
  constructor(
    socket: Socket,
    uploadsPath: string,
    maxChunkSizeBytes: number = 512 * 1024 // 512 KB
  ) {
    this.info = {
      maxChunkSizeBytes,
      tempStoragePath: uploadsPath,
      transfersInProgress: [],
    };
    // empty the temp uploads folder on server
    fs.rmSync(this.info.tempStoragePath, { recursive: true, force: true });
    fs.mkdirSync(this.info.tempStoragePath, { recursive: true });
    // setup socket routines
    this.routines(socket);
  }
  // setup socket routines
  routines = async (socket: Socket) => {
    uploadRequest(socket, this.info);
    receivingChunk(socket, this.info);
    downloadRequest(socket, this.info);
    sendingChunk(socket, this.info);
    cancelTransfer(socket, this.info);
  };
}
