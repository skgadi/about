import type { GSK_PKG_FL_DT_UPLOAD_ACK } from '../../types/data-transfer';
import { useGskPkgFileStore } from '../store/file-store';

export const events = (label: string, ...args: unknown[]) => {
  switch (label) {
    case 'GSK_PKG_FL_DT_UPLOAD_ACK': {
      const payloadIn: GSK_PKG_FL_DT_UPLOAD_ACK = args[0] as GSK_PKG_FL_DT_UPLOAD_ACK;
      const gskPkgFileStore = useGskPkgFileStore();
      // Handle the upload acknowledgment using gskPkgFileStore
      gskPkgFileStore.uploadAckReceived(payloadIn);
      return;
    }

    default:
      return;
  }
};

export default events;
