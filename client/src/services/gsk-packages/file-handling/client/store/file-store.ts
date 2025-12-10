import { defineStore, acceptHMRUpdate } from 'pinia';
import type {
  GSK_PKG_FL_ST_DB_INFO_CLIENT,
  GSK_PKG_FL_ST_DB_RECORD_CLIENT,
} from '../../types/structure';
import type {
  GSK_PKG_FL_DT_FAILED,
  GSK_PKG_FL_DT_REQUEST_CHUNK,
  GSK_PKG_FL_DT_TRANSFER_COMPLETE,
  GSK_PKG_FL_DT_UPLOAD_ACK,
  GSK_PKG_FL_DT_UPLOAD_INIT,
  GSK_PKG_FL_DT_TRANSFER_CHUNK,
  GSK_PKG_FL_DT_CANCEL_TRANSFER,
  GSK_PKG_FL_DT_DOWNLOAD_INIT,
  GSK_PKG_FL_ST_DOWNLOAD_ACK,
} from '../../types/data-transfer';
import { useSocketStore } from 'src/stores/socket-store';
import { useUsersStore } from 'src/stores/users-store';

export const useGskPkgFileStore = defineStore('gskPkgFile', {
  state: () => ({
    info: {
      tempStoragePath: 'temp-uploads',
      transfersInProgress: [],
    } as GSK_PKG_FL_ST_DB_INFO_CLIENT,
    uploads: [] as {
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
      (sha512Hash: string): number => {
        const upload = state.uploads.find((el) => el.sha512Hash === sha512Hash);
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
        db.createObjectStore('completedFiles', { keyPath: 'fileId' });
      };
    },

    // Download Actions
    downloadInit(fileId: string) {
      // find the file record in transfersInProgress
      const record = this.info.transfersInProgress.find((el) => el.fileId === fileId);
      if (record) {
        // console.warn('Download already in progress for fileId:', fileId);
        return;
      }

      // find the file in public and self details of user
      const usersStore = useUsersStore();
      const publicDetailsFile = usersStore.userPublicDetails?.details?.documents?.find(
        (doc) => doc.id === fileId,
      );
      const fullDetailsFile = usersStore.userFullDetails?.details?.documents?.find(
        (doc) => doc.id === fileId,
      );
      const fileRecord = publicDetailsFile || fullDetailsFile;
      if (!fileRecord) {
        console.warn('File record not found for downloadInit with fileId:', fileId);
        return;
      }

      const payload: GSK_PKG_FL_DT_DOWNLOAD_INIT = {
        id: 'GSK_PKG_FL_DT_FILE_DOWNLOAD_INIT',
        payload: {
          fileInfo: {
            fileId: fileRecord.id,
            folderPath: fileRecord.serverFilePath,
            fileMeta: {
              extension: fileRecord.extension,
              fileName: fileRecord.originalName,
              mimeType: fileRecord.mimeType || '',
              sha512Hash: fileRecord.checksumSHA512,
              sizeInBytes: fileRecord.sizeBytes,
            },
          },
        },
      };
      useSocketStore().emit('GSK_PKG_FL_DT_FILE_DOWNLOAD_INIT', payload);

      // add to transfersInProgress
      const newTransferRecord: GSK_PKG_FL_ST_DB_RECORD_CLIENT = {
        extension: fileRecord.extension,
        fileId: fileRecord.id,
        sizeInBytes: fileRecord.sizeBytes,
        sha512Hash: fileRecord.checksumSHA512,
        mimeType: fileRecord.mimeType || '',
        fileName: fileRecord.originalName,
        localStoragePath: this.info.tempStoragePath,
        chunksCompleted: [], // to be filled when info is received from server
        remainingChunks: [], // to be filled when info is received from server
        isComplete: false,
        lastChunkSizeInBytes: 0, // to be filled when info is received from server
        standardChunkSizeInBytes: 0, // to be filled when info is received from server
        totalNumberOfChunks: 0, // to be filled when info is received from server
      };
      this.info.transfersInProgress.push(newTransferRecord);
    },

    downloadAckReceived(data: GSK_PKG_FL_ST_DOWNLOAD_ACK) {
      console.log('Download acknowledgment received:', data);
      const record = this.info.transfersInProgress.find(
        (el) => el.fileId === data.payload.fileInfo.fileId,
      );
      if (!record) {
        console.warn('No matching download record found for download acknowledgment.');
        return;
      }
      record.totalNumberOfChunks = data.payload.fileInfo.totalNumberOfChunks;
      record.standardChunkSizeInBytes = data.payload.fileInfo.standardChunkSizeInBytes;
      record.lastChunkSizeInBytes = data.payload.fileInfo.lastChunkSizeInBytes;
      record.chunksCompleted = [];
      record.remainingChunks = Array.from(
        { length: data.payload.fileInfo.totalNumberOfChunks },
        (_, i) => i,
      );
    },
    aChunkDownloaded(inData: GSK_PKG_FL_DT_TRANSFER_CHUNK) {
      const recordNameToStore =
        inData.payload.chunk.fileId + '_chunk_' + inData.payload.chunk.chunkIndex;
      const dbRequest = indexedDB.open(this.info.tempStoragePath, 1);
      dbRequest.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction('fileChunks', 'readwrite');
        const store = transaction.objectStore('fileChunks');
        const putRequest = store.put({
          fileId_chunkId: recordNameToStore,
          data: inData.payload.chunk.data,
        });
        putRequest.onsuccess = () => {
          // Update local record
          const localFileData = this.info.transfersInProgress.find(
            (el) => el.fileId === inData.payload.chunk.fileId,
          );
          if (localFileData) {
            localFileData.chunksCompleted.push(inData.payload.chunk.chunkIndex);
            if (localFileData.chunksCompleted.length === localFileData.totalNumberOfChunks) {
              localFileData.isComplete = true;
            }
          }
        };
      };
    },

    completeDownload(fileId: string) {
      const dbRequest = indexedDB.open(this.info.tempStoragePath, 1);
      // read each chunk from indexedDB and append to the `completedFiles` location
      dbRequest.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const chunksTransaction = db.transaction('fileChunks', 'readonly');
        const finalFileTransaction = db.transaction('completedFiles', 'readwrite');
        const chunksStore = chunksTransaction.objectStore('fileChunks');
        const finalFileStore = finalFileTransaction.objectStore('completedFiles');

        const localFileData = this.info.transfersInProgress.find((el) => el.fileId === fileId);
        if (!localFileData) {
          console.warn('No local file data found for completing download of fileId:', fileId);
          return;
        }
        const chunksData: Uint8Array[] = [];
        let chunksFetched = 0;

        for (let i = 0; i < localFileData.totalNumberOfChunks; i++) {
          const recordNameToFetch = fileId + '_chunk_' + i;
          const getRequest = chunksStore.get(recordNameToFetch);
          getRequest.onsuccess = () => {
            const result = getRequest.result;
            if (result && result.data) {
              chunksData[i] = result.data;
            } else {
              console.error('Missing chunk data for', recordNameToFetch);
            }
            chunksFetched++;
            if (chunksFetched === localFileData.totalNumberOfChunks) {
              // All chunks fetched, now combine and store
              const totalSize = chunksData.reduce((acc, chunk) => acc + chunk.byteLength, 0);
              const combinedArray = new Uint8Array(totalSize);
              let offset = 0;
              for (const chunk of chunksData) {
                combinedArray.set(chunk, offset);
                offset += chunk.byteLength;
              }
              const putFinalRequest = finalFileStore.put({
                fileId: fileId,
                data: combinedArray,
              });
              putFinalRequest.onsuccess = () => {
                console.log('Final file stored successfully for fileId:', fileId);
              };
            }
          };
        }
      };
    },

    // Upload Actions

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
      const out = {
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

    stopUpload(sha512Hash: string) {
      const uploadIndex = this.uploads.findIndex((el) => el.sha512Hash === sha512Hash);
      const fileId = this.uploads[uploadIndex]?.fileId;

      // remove from uploads
      if (uploadIndex !== -1) {
        this.uploads.splice(uploadIndex, 1);
      }

      if (!fileId) {
        return;
      }

      // emit cancel transfer if fileId exists
      const toServer: GSK_PKG_FL_DT_CANCEL_TRANSFER = {
        id: 'GSK_PKG_FL_DT_CANCEL_TRANSFER',
        payload: {
          fileId,
          reason: 'User cancelled the upload',
        },
      };
      console.log('Emitting cancel transfer for fileId:', toServer);
      useSocketStore().emit('GSK_PKG_FL_DT_CANCEL_TRANSFER', toServer);
    },
  },
});
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useGskPkgFileStore, import.meta.hot));
}
