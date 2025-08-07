import type { GSK_APP_CONST_SETTINGS_TRANSFER } from 'src/services/library/types/client-server-data-transfer';
import { useSettingsStore } from 'src/stores/settings-store';

export const events = (label: string, ...args: unknown[]) => {
  switch (label) {
    case 'GSK_APP_INIT_SETTINGS': {
      const payloadIn: GSK_APP_CONST_SETTINGS_TRANSFER = args[0] as GSK_APP_CONST_SETTINGS_TRANSFER;
      const settingsStore = useSettingsStore();
      settingsStore.setAppName(payloadIn.payload.appName);
      settingsStore.setAppVersion(payloadIn.payload.appVersion);
      return;
    }

    default:
      return;
  }
};

export default events;
