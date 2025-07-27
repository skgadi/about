import { defineStore, acceptHMRUpdate } from 'pinia';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    socketServerUrl: 'localhost:3333', // Default socket server URL
    appName: '--- Your App Name ---', // Default app name
    appVersion: '0.0.0', // Default app version
  }),

  getters: {},

  actions: {
    setSocketServerUrl(url: string) {
      this.socketServerUrl = url;
    },
    setAppName(name: string) {
      this.appName = name;
    },
    setAppVersion(version: string) {
      this.appVersion = version;
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettingsStore, import.meta.hot));
}
