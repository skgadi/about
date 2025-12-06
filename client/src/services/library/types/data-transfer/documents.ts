import type { GSK_PKG_FL_ST_FILE_METADATA } from '../../../../services/gsk-packages/file-handling/types/structure.js';

export interface GSK_CS_DOCUMENT_UPLOAD_REQUEST {
  id: 'GSK_CS_DOCUMENT_UPLOAD_REQUEST';
  payload: {
    fileMeta: GSK_PKG_FL_ST_FILE_METADATA;
    fileId: string;
    userId: string;
  };
}
