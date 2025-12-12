import type { GSK_SC_AI_AVAILABLE_MODELS } from 'src/services/library/types/data-transfer/ai';
import { useSettingsStore } from 'src/stores/settings-store';

export const events = (label: string, ...args: unknown[]) => {
  switch (label) {
    case 'GSK_SC_AI_AVAILABLE_MODELS': {
      const payloadIn: GSK_SC_AI_AVAILABLE_MODELS = args[0] as GSK_SC_AI_AVAILABLE_MODELS;
      const settingsStore = useSettingsStore();
      settingsStore.setAvailableAiModels(payloadIn.payload.models);
      return;
    }

    default:
      return;
  }
};

export default events;
