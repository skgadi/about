import { io, type Socket } from 'socket.io-client';
import { useSocketStore } from 'src/stores/socket-store';
import { useSettingsStore } from 'src/stores/settings-store';
import { notify } from 'src/services/notifications/index';
import { getSocketConfig } from './get-socket-config';
import { useAuthStore } from 'src/stores/auth-store';

import appSettings from './events/settings';
import authEvents from './events/auth';
import notificationsEvents from './events/notifications';
import users from './events/users';
import fileHandlingEvents from 'src/services/gsk-packages/file-handling/client/socket-event/events';

class SocketioService {
  socket: Socket | null;

  constructor() {
    this.socket = null;
  }

  async setupSocketConnection() {
    //const isProduction = process.env.NODE_ENV === 'production';
    await getSocketConfig();
    const settingsStore = useSettingsStore();
    const authStore = useAuthStore();
    this.socket = io(settingsStore.socketServerUrl, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      withCredentials: true,
    }); // Replace with your server URL

    this.socket.on('connect', () => {
      const socketStore = useSocketStore();
      socketStore.connected();
      authStore.signOut();
      socketStore.resubscribeAll();

      notify('Conexión exitosa', 'Socket', 'positive');
    });

    this.socket.on('disconnect', () => {
      useSocketStore().disconnected();
      authStore.signOut();

      notify('Servidor desconectado', 'Socket', 'negative');
    });

    this.socket.onAny((label, ...args) => {
      //console.log(label, args);
      useSocketStore().detectedReceivedActivity();
      appSettings(label, ...args);
      authEvents(label, ...args);
      notificationsEvents(label, ...args);
      users(label, ...args);
      fileHandlingEvents(label, ...args);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  /*emit(event: string, data: unknown): void {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }*/

  // Add more methods as needed for your application
}

export default new SocketioService();
