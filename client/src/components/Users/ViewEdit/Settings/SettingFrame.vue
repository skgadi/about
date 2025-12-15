<template>
  <div class="q-py-lg" style="max-width: 800px; width: 100%; margin: auto">
    <div>
      <span class="text-h6"> AI Model Preference: </span>
      <u class="q-ml-md text-primary text-weight-medium">
        <text-field
          :html-text="usersStore.userFullDetails?.settings?.aiModelPreference || ''"
          :editable="true"
          :select-options="aiModels"
          allow-empty
          @updated-text="
            (updatedText) =>
              updateSettings({
                ...usersStore.userFullDetails?.settings,
                aiModelPreference: updatedText,
              } as GSK_USER_SETTINGS)
          "
        />
      </u>
    </div>
  </div>
</template>
<script setup lang="ts">
import TextField from 'src/components/Users/ViewEdit/Elements/TextField.vue';

import { useUsersStore } from 'src/stores/users-store';
import { useSocketStore } from 'src/stores/socket-store';
import { useSettingsStore } from 'src/stores/settings-store';
import { onMounted, computed } from 'vue';
import type { GSK_CS_AI_REQUEST_AVAILABLE_MODELS } from 'src/services/library/types/data-transfer/ai';
import type { GSK_QUASAR_OPTION } from 'src/services/library/types/structures/client';
import type { GSK_USER_SETTINGS } from 'src/services/library/types/structures/users';
import type { GSK_CS_UPDATE_USER_SETTING } from 'src/services/library/types/data-transfer/settings';

const usersStore = useUsersStore();
const socketStore = useSocketStore();
const settingsStore = useSettingsStore();

onMounted(() => {
  if (!settingsStore.availableAiModels.length) {
    const payload: GSK_CS_AI_REQUEST_AVAILABLE_MODELS = {
      id: 'GSK_CS_AI_REQUEST_AVAILABLE_MODELS',
    };
    socketStore.emit('GSK_CS_AI_REQUEST_AVAILABLE_MODELS', payload);
  }
});

const aiModels = computed(() =>
  settingsStore.availableAiModels.map((model) => {
    const out: GSK_QUASAR_OPTION = {
      value: model.id,
      label: model.name,
      description: model.description,
    };
    return out;
  }),
);

const updateSettings = (settings: GSK_USER_SETTINGS) => {
  if (!usersStore.userFullDetails?.id) return;
  const payload: GSK_CS_UPDATE_USER_SETTING = {
    id: 'GSK_CS_UPDATE_USER_SETTING',
    payload: {
      userId: usersStore.userFullDetails.id,
      settings,
    },
  };
  socketStore.emit('GSK_CS_UPDATE_USER_SETTING', payload);
};
</script>
