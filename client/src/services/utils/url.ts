import { useSettingsStore } from 'src/stores/settings-store';
import { useSocketStore } from 'src/stores/socket-store';

const settingsStore = useSettingsStore();
const socketStore = useSocketStore();

export function downloadFileFromURL(url: string): void {
  const link = document.createElement('a');
  link.href = url;
  document.body.appendChild(link); // Append to body to make it clickable
  link.click(); // Programmatically click the link to trigger download
  document.body.removeChild(link); // Clean up the element
}

export function prepareDownloadURL(userId: string, fileId: string): string {
  const mySocketId = socketStore.getSocketId();
  if (!mySocketId) {
    return '';
  }
  return (
    settingsStore.downloadpath +
    `${encodeURIComponent(userId)}/${encodeURIComponent(fileId)}/${encodeURIComponent(mySocketId)}`
  );
}

export function downloadADocument(userId: string, fileId: string) {
  const downloadURL = prepareDownloadURL(userId, fileId);
  if (downloadURL) {
    downloadFileFromURL(downloadURL);
  } else {
    console.error('Unable to prepare download URL. Socket ID may be missing.');
  }
}
