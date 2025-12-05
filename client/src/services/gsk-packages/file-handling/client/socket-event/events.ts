import type {
  GSK_PKG_FL_DT_REQUEST_CHUNK,
  GSK_PKG_FL_DT_TRANSFER_COMPLETE,
  GSK_PKG_FL_DT_UPLOAD_ACK,
} from '../../types/data-transfer';
import { useGskPkgFileStore } from '../store/file-store';

export const events = (label: string, ...args: unknown[]) => {
  const gskPkgFileStore = useGskPkgFileStore();
  switch (label) {
    case 'GSK_PKG_FL_DT_UPLOAD_ACK': {
      const payloadIn: GSK_PKG_FL_DT_UPLOAD_ACK = args[0] as GSK_PKG_FL_DT_UPLOAD_ACK;
      // Handle the upload acknowledgment using gskPkgFileStore
      gskPkgFileStore.uploadAckReceived(payloadIn);
      return;
    }
    case 'GSK_PKG_FL_DT_REQUEST_CHUNK': {
      const payloadIn: GSK_PKG_FL_DT_REQUEST_CHUNK = args[0] as GSK_PKG_FL_DT_REQUEST_CHUNK;
      // Handle the chunk request using gskPkgFileStore
      gskPkgFileStore.uploadAChunk(payloadIn);
      return;
    }
    case 'GSK_PKG_FL_DT_TRANSFER_COMPLETE': {
      const payloadIn: GSK_PKG_FL_DT_TRANSFER_COMPLETE = args[0] as GSK_PKG_FL_DT_TRANSFER_COMPLETE;
      // Handle the transfer completion using gskPkgFileStore
      gskPkgFileStore.markUploadComplete(payloadIn);
      return;
    }

    default:
      return;
  }
};

export default events;
