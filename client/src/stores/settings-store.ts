import { defineStore, acceptHMRUpdate } from 'pinia';
import {
  GSK_APP_GLOBAL_CONSTANT_DEFAULT_NAME,
  GSK_APP_GLOBAL_CONSTANT_VERSION,
} from 'src/services/library/constants/app-init';
import type {
  GSK_STRUCTURES_CONSTANT_SETTINGS,
  GSK_STRUCTURES_VARIABLE_SETTINGS,
} from 'src/services/library/types/structures/settings';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    constants: {
      appName: GSK_APP_GLOBAL_CONSTANT_DEFAULT_NAME,
      appVersion: GSK_APP_GLOBAL_CONSTANT_VERSION,
    },
    variables: {
      appLogo: '',
    } as GSK_STRUCTURES_VARIABLE_SETTINGS,
    socketServerUrl: 'localhost:3333', // Default socket server URL
  }),

  getters: {},

  actions: {
    setSocketServerUrl(url: string) {
      this.socketServerUrl = url;
    },
    setVariableSettings(settings: GSK_STRUCTURES_VARIABLE_SETTINGS) {
      this.variables = settings;
    },
    setConstantsSettings(settings: GSK_STRUCTURES_CONSTANT_SETTINGS) {
      this.constants = settings;
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettingsStore, import.meta.hot));
}
