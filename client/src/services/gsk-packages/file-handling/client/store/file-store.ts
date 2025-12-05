import { defineStore, acceptHMRUpdate } from 'pinia';
import type { GSK_PKG_FL_ST_DB_INFO_CLIENT } from '../../types/structure';
import type {
  GSK_PKG_FL_DT_FAILED,
  GSK_PKG_FL_DT_REQUEST_CHUNK,
  GSK_PKG_FL_DT_TRANSFER_COMPLETE,
  GSK_PKG_FL_DT_UPLOAD_ACK,
  GSK_PKG_FL_DT_UPLOAD_INIT,
  GSK_PKG_FL_DT_TRANSFER_CHUNK,
} from '../../types/data-transfer';
import { useSocketStore } from 'src/stores/socket-store';

export const useGskPkgFileStore = defineStore('gskPkgFile', {
  state: () => ({
    info: {
      tempStoragePath: 'temp-uploads',
      transfersInProgress: [],
    } as GSK_PKG_FL_ST_DB_INFO_CLIENT,
    uploads: [] as {
      localUuid: string;
      fileId: string;
      sha512Hash: string;
      file: File;
      isFinished: boolean;
      uploadedSizeInBytes: number;
    }[],
  }),

  getters: {
    uploadProgress:
      (state) =>
      (localUuid: string): number => {
        const upload = state.uploads.find((el) => el.localUuid === localUuid);
        if (!upload) {
          return 0;
        }
        return (upload.uploadedSizeInBytes / upload.file.size) * 100;
      },
  },

  actions: {
    resetLocalMemory() {
      indexedDB.deleteDatabase(this.info.tempStoragePath);
      this.info.transfersInProgress = [];
      indexedDB.open(this.info.tempStoragePath, 1).onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        db.createObjectStore('fileChunks', { keyPath: 'fileId_chunkId' });
        db.createObjectStore('fileRecords', { keyPath: 'fileId' });
      };
    },

    uploadInit(file: File, sha512Hash: string, localUuid: string) {
      const payload: GSK_PKG_FL_DT_UPLOAD_INIT = {
        id: 'GSK_PKG_FL_DT_FILE_UPLOAD_INIT',
        payload: {
          fileInfo: {
            fileName: file.name.split('.').slice(0, -1).join('.'), // filename without extension
            extension: file.name.split('.').pop() || '',
            sizeInBytes: file.size,
            sha512Hash: sha512Hash,
            mimeType: file.type,
          },
        },
      };
      const out = {
        localUuid: localUuid,
        sha512Hash: sha512Hash,
        file: file,
        fileId: '', // to be filled upon receiving upload ack
        isFinished: false,
        uploadedSizeInBytes: 0,
      };
      this.uploads.push(out);
      useSocketStore().emit('GSK_PKG_FL_DT_UPLOAD_INIT', payload);
    },

    uploadAckReceived(data: GSK_PKG_FL_DT_UPLOAD_ACK) {
      const record = this.uploads.find(
        (el) => el.sha512Hash === data.payload.fileInfo.sha512Hash && !el.fileId,
      );
      if (!record) {
        console.error('No matching upload record found for upload acknowledgment.');
        return;
      }
      record.fileId = data.payload.fileInfo.fileId;
    },

    uploadAChunk(inData: GSK_PKG_FL_DT_REQUEST_CHUNK) {
      const localFileData = this.uploads.find(
        (el) => el.fileId === inData.payload.chunkInfo.fileId,
      );
      if (!localFileData) {
        const errorPayload: GSK_PKG_FL_DT_FAILED = {
          id: 'GSK_PKG_FL_DT_FAILED',
          payload: {
            error: 'file-not-found',
            errorMessage: 'Chunk upload request failed',
          },
        };
        useSocketStore().emit('GSK_PKG_FL_DT_FAILED', errorPayload);
        console.error('No matching file found for chunk upload request.');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const chunkPayload: GSK_PKG_FL_DT_TRANSFER_CHUNK = {
          id: 'GSK_PKG_FL_DT_TRANSFER_CHUNK',
          payload: {
            chunk: {
              fileId: inData.payload.chunkInfo.fileId,
              chunkIndex: inData.payload.chunkInfo.chunkIndex,
              chunkSizeInBytes: arrayBuffer.byteLength,
              data: new Uint8Array(arrayBuffer),
              lastChunkSizeInBytes: inData.payload.chunkInfo.lastChunkSizeInBytes,
              standardChunkSizeInBytes: inData.payload.chunkInfo.standardChunkSizeInBytes,
              totalNumberOfChunks: inData.payload.chunkInfo.totalNumberOfChunks,
            },
          },
        };
        useSocketStore().emit('GSK_PKG_FL_DT_TRANSFER_CHUNK', chunkPayload);
      };
      const start =
        inData.payload.chunkInfo.chunkIndex * inData.payload.chunkInfo.standardChunkSizeInBytes;
      const end = start + inData.payload.chunkInfo.chunkSizeInBytes;
      localFileData.uploadedSizeInBytes += inData.payload.chunkInfo.chunkSizeInBytes;
      reader.readAsArrayBuffer(localFileData.file.slice(start, end));
    },
    markUploadComplete(data: GSK_PKG_FL_DT_TRANSFER_COMPLETE) {
      const localFileData = this.uploads.find((el) => el.fileId === data.payload.fileId);
      if (localFileData) {
        localFileData.isFinished = true;
      }
    },
  },
});
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useGskPkgFileStore, import.meta.hot));
}
