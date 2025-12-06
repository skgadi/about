import type { GSK_PKG_FL_ST_FILE_METADATA } from '../../types/structure';
import { createSHA512 } from 'hash-wasm'; // The necessary import
import { sha512 } from 'js-sha512';

export const getFileMeta = (file: File, sha512Hash: string): GSK_PKG_FL_ST_FILE_METADATA => {
  const fileMeta: GSK_PKG_FL_ST_FILE_METADATA = {
    extension: file.name.split('.').pop() || '',
    // filename withuot extension
    fileName: file.name.slice(0, -(file.name.split('.').pop()?.length ?? 0) - 1),
    mimeType: file.type,
    sizeInBytes: file.size,
    sha512Hash: sha512Hash,
  };
  return fileMeta;
};

export async function hashFileSHA512WithJsSha512(file: File): Promise<string> {
  try {
    const CHUNK_SIZE = 1024 * 1024; // 1 MB
    const hasher = sha512.create();

    let offset = 0;

    while (offset < file.size) {
      const slice = file.slice(offset, offset + CHUNK_SIZE);
      const chunk = new Uint8Array(await slice.arrayBuffer());

      hasher.update(chunk);

      offset += CHUNK_SIZE;

      // Yield to event loop to avoid blocking UI
      await new Promise((r) => setTimeout(r, 0));
    }

    return hasher.hex(); // final SHA-512
  } catch (e) {
    console.error(e);
    return ''; // per your requirement
  }
}

export async function hashFileSHA512WithWasm(file: File): Promise<string> {
  try {
    const CHUNK_SIZE = 1024 * 1024; // 1 MB

    const hasher = await createSHA512();
    hasher.init();

    let offset = 0;

    while (offset < file.size) {
      const slice = file.slice(offset, offset + CHUNK_SIZE);
      const chunk = new Uint8Array(await slice.arrayBuffer());

      hasher.update(chunk);

      offset += CHUNK_SIZE;

      // yield to keep UI responsive
      await new Promise((r) => setTimeout(r, 0));
    }

    const hash = hasher.digest(); // returns HEX string
    return hash;
  } catch (err) {
    console.error('hashFileSHA512 error:', err);
    return '';
  }
}
