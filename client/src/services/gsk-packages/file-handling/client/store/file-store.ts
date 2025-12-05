import { defineStore, acceptHMRUpdate } from 'pinia';
import type {
  GSK_PKG_FL_ST_DB_INFO_CLIENT,
  GSK_PKG_FL_ST_DB_RECORD,
  GSK_PKG_FL_ST_DB_RECORD_CLIENT,
} from '../../types/structure';
import type {
  GSK_PKG_FL_DT_UPLOAD_ACK,
  GSK_PKG_FL_DT_UPLOAD_INIT,
} from '../../types/data-transfer';
import { useSocketStore } from 'src/stores/socket-store';

export const useGskPkgFileStore = defineStore('gskPkgFile', {
  state: () => ({
    info: {
      tempStoragePath: 'temp-uploads',
      transfersInProgress: [],
    } as GSK_PKG_FL_ST_DB_INFO_CLIENT,
    parallelUploads: 3,
  }),

  getters: {},

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

    uploadInit(file: File, sha512Hash: string) {
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
      const out: GSK_PKG_FL_ST_DB_RECORD_CLIENT = {
        ...payload.payload.fileInfo,
        localStoragePath: this.info.tempStoragePath,
        chunksCompleted: [],
        remainingChunks: [],
        isComplete: false,
        fileId: '', // to be filled on server response
        totalNumberOfChunks: 0,
        standardChunkSizeInBytes: 0,
        lastChunkSizeInBytes: 0,
        sha512Hash: payload.payload.fileInfo.sha512Hash,
        mimeType: payload.payload.fileInfo.mimeType,
        file: file,
      };
      this.info.transfersInProgress.push(out);
      useSocketStore().emit('GSK_PKG_FL_DT_UPLOAD_INIT', payload);
    },

    uploadAckReceived(data: GSK_PKG_FL_DT_UPLOAD_ACK) {
      const localStoragePath = this.info.tempStoragePath;
      const record: GSK_PKG_FL_ST_DB_RECORD_CLIENT | undefined = this.info.transfersInProgress.find(
        (record) => record.sha512Hash === data.payload.fileInfo.sha512Hash && !record.fileId,
      );
      if (!record) {
        console.error('No matching upload record found for upload acknowledgment.');
        return;
      }
      const out: GSK_PKG_FL_ST_DB_RECORD = {
        ...data.payload.fileInfo,
        localStoragePath: localStoragePath,
        chunksCompleted: [],
        remainingChunks: Array.from(
          { length: data.payload.fileInfo.totalNumberOfChunks },
          (_, i) => i,
        ),
        isComplete: false,
      };
      Object.assign(record, out);
    },

    uploadAChunk(fileId: string) {
      const record: GSK_PKG_FL_ST_DB_RECORD_CLIENT | undefined = this.info.transfersInProgress.find(
        (rec) => rec.fileId === fileId,
      );
      if (!record) {
        return;
      }
      if (record.chunksCompleted.length === record.totalNumberOfChunks) {
        // All chunks uploaded
        return;
      }
      const chunkIndex = record.remainingChunks.shift();
      if (chunkIndex === undefined) {
        return;
      }

      const start = chunkIndex * record.standardChunkSizeInBytes;
      const end =
        chunkIndex === record.totalNumberOfChunks - 1
          ? start + record.lastChunkSizeInBytes
          : start + record.standardChunkSizeInBytes;
      const chunkData = record.file.slice(start, end);

      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const chunkPayload = {
          id: 'GSK_PKG_FL_DT_FILE_CHUNK_TRANSFER',
          payload: {
            chunk: {
              fileId: record.fileId,
              chunkIndex: chunkIndex,
              totalChunks: record.totalNumberOfChunks,
              chunkSizeInBytes: arrayBuffer.byteLength,
              data: arrayBuffer,
            },
          },
        };
        useSocketStore().emit('GSK_PKG_FL_DT_TRANSFER_CHUNK', chunkPayload);
        record.chunksCompleted.push(chunkIndex);
      };
      reader.readAsArrayBuffer(chunkData);
      return record;
    },
  },
});
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useGskPkgFileStore, import.meta.hot));
}
