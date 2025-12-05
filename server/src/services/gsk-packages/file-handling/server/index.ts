import { Server, Socket } from "socket.io";
import { GSK_PKG_FL_ST_DB_INFO_SERVER } from "../types/structure.js";
import path from "path";
import NodeSpecificUtils from "../../../utils/node-specific.js";
import fs from "fs";
import { uploadRequest } from "./upload-request.js";
import { receivingChunk } from "./receiving-chunk.js";
import { cancelTransfer } from "./cancel-transfer.js";
import { sendingChunk } from "./sending-chunk.js";
import { downloadRequest } from "./download-request.js";
import { socketDisconnected } from "./socket-disconnected.js";
import { uploadLoop } from "./upload-loop.js";

export class gskPkgFileHandlingServerIndex {
  private info: GSK_PKG_FL_ST_DB_INFO_SERVER;
  constructor(
    io: Server,
    uploadsPath: string,
    maxChunkSizeBytes: number = 5 * 1024 * 1024 // 5 MB default
  ) {
    this.info = {
      maxChunkSizeBytes,
      tempStoragePath: uploadsPath,
      transfersInProgress: [],
      socketDownloads: [],
      socketUploads: [],
      io,
      limits: {
        totalUploads: 100,
        totalDownloads: 100,
        concurrentUploadsPerClient: 10,
        concurrentDownloadsPerClient: 10,
        concurrentUploadsPerFile: 3,
        concurrentDownloadsPerFile: 3,
      },
    };
    // empty the temp uploads folder on server
    fs.rmSync(this.info.tempStoragePath, { recursive: true, force: true });
    fs.mkdirSync(this.info.tempStoragePath, { recursive: true });
    this.startLoop();
  }
  // setup socket routines
  routines = async (socket: Socket) => {
    uploadRequest(socket, this.info);
    receivingChunk(socket, this.info);
    downloadRequest(socket, this.info);
    sendingChunk(socket, this.info);
    cancelTransfer(socket, this.info);
  };
  socketDisconnected = (socketId: string) => {
    socketDisconnected(this.info, socketId);
  };
  startLoop = () => {
    // upload heartbeat loop
    setInterval(() => {
      uploadLoop(this.info);
    }, 1000); // every second
  };
}
