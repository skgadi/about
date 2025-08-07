import type {
  GSK_APP_CONST_SETTINGS_TRANSFER,
  GSK_APP_VAR_SETTINGS_TRANSFER,
} from 'src/services/library/types/client-server-data-transfer';
import { useSettingsStore } from 'src/stores/settings-store';

export const events = (label: string, ...args: unknown[]) => {
  switch (label) {
    case 'GSK_APP_CONST_SETTINGS_TRANSFER': {
      const payloadIn: GSK_APP_CONST_SETTINGS_TRANSFER = args[0] as GSK_APP_CONST_SETTINGS_TRANSFER;
      const settingsStore = useSettingsStore();
      settingsStore.setConstantsSettings(payloadIn.payload);
      return;
    }

    case 'GSK_APP_VAR_SETTINGS_TRANSFER': {
      const payloadIn: GSK_APP_VAR_SETTINGS_TRANSFER = args[0] as GSK_APP_VAR_SETTINGS_TRANSFER;
      const settingsStore = useSettingsStore();
      settingsStore.setVariableSettings(payloadIn.payload);
      return;
    }

    default:
      return;
  }
};

export default events;
