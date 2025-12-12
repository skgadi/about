import { defineStore, acceptHMRUpdate } from 'pinia';
import {
  GSK_APP_GLOBAL_CONSTANT_DEFAULT_NAME,
  GSK_APP_GLOBAL_CONSTANT_VERSION,
} from 'src/services/library/constants/app-init';
import type {
  GSK_STRUCTURES_CONSTANT_SETTINGS,
  GSK_STRUCTURES_VARIABLE_SETTINGS,
} from 'src/services/library/types/structures/settings';
import { Cookies } from 'quasar';
import type { GSK_AI_MODEL } from 'src/services/library/types/structures/ai';

function getAvailableConstantSettingsFromCookies(): GSK_STRUCTURES_CONSTANT_SETTINGS {
  const settings: GSK_STRUCTURES_CONSTANT_SETTINGS = {
    appName: GSK_APP_GLOBAL_CONSTANT_DEFAULT_NAME,
    appVersion: GSK_APP_GLOBAL_CONSTANT_VERSION,
  };
  try {
    const allSettings: Partial<GSK_STRUCTURES_CONSTANT_SETTINGS> =
      Cookies.get('GSK_STRUCTURES_CONSTANT_SETTINGS') || '{}';
    Object.keys(settings).forEach((key) => {
      const typedKey = key as keyof GSK_STRUCTURES_CONSTANT_SETTINGS;
      if (allSettings[typedKey]) {
        settings[typedKey] = allSettings[typedKey]!;
      }
    });
  } catch (error) {
    console.error('Error getting settings from cookies:', error);
  }
  return settings;
}

function getAvailableVariableSettingsFromCookies(): GSK_STRUCTURES_VARIABLE_SETTINGS {
  const settings: GSK_STRUCTURES_VARIABLE_SETTINGS = {
    appLogo: '',
  };
  try {
    const allSettings: Partial<GSK_STRUCTURES_VARIABLE_SETTINGS> =
      Cookies.get('GSK_STRUCTURES_VARIABLE_SETTINGS') || '{}';
    Object.keys(settings).forEach((key) => {
      const typedKey = key as keyof GSK_STRUCTURES_VARIABLE_SETTINGS;
      if (allSettings[typedKey]) {
        settings[typedKey] = allSettings[typedKey]!;
      }
    });
  } catch (error) {
    console.error('Error getting settings from cookies:', error);
  }
  return settings;
}

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    constants: getAvailableConstantSettingsFromCookies(),
    variables: getAvailableVariableSettingsFromCookies(),
    availableAiModels: [] as GSK_AI_MODEL[],
    socketServerUrl: '//localhost:3333', // Default socket server URL
    appendToTitle: [] as string[],
  }),

  getters: {
    downloadpath: (state) => {
      return state.socketServerUrl + '/download-server-document/';
    },
    viewerPath: (state) => {
      return state.socketServerUrl + '/view-server-document/';
    },
  },

  actions: {
    setAvailableAiModels(models: GSK_AI_MODEL[]) {
      this.availableAiModels = models;
    },
    setAppendToTitle(titleParts: string[]) {
      this.appendToTitle = titleParts;
    },
    setSocketServerUrl(url: string) {
      this.socketServerUrl = url;
    },
    setVariableSettings(settings: GSK_STRUCTURES_VARIABLE_SETTINGS) {
      this.variables = settings;
      Cookies.set('GSK_STRUCTURES_VARIABLE_SETTINGS', JSON.stringify(settings));
    },
    setConstantsSettings(settings: GSK_STRUCTURES_CONSTANT_SETTINGS) {
      this.constants = settings;
      Cookies.set('GSK_STRUCTURES_CONSTANT_SETTINGS', JSON.stringify(settings));
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettingsStore, import.meta.hot));
}
