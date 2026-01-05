<template>
  <template v-if="!hidden">
    <div v-if="editable">
      <q-btn
        size="sm"
        color="primary"
        icon="mdi-plus"
        round
        dense
        @click="
          updateExtraInfo([
            ...(extraInfo || []),
            {
              typeOfInfo: 'text',
              data: '',
              title: 'New Info',
              description: '',
              isPublic: true,
            },
          ])
        "
      >
        <q-tooltip>Add Extra Info</q-tooltip>
      </q-btn>
    </div>
    <div class="q-gutter-md">
      <template v-for="(infoViewer, index) in extraInfo || []" :key="index">
        <div>
          <main-element
            :info-viewer="infoViewer"
            :editable="editable"
            @updated-info="
              (updatedInfo: GSK_INFO_VIEWER) => {
                const newExtraInfo = [...(extraInfo || [])];
                newExtraInfo[index] = updatedInfo;
                updateExtraInfo(newExtraInfo);
              }
            "
          />
        </div>
      </template>
    </div>
  </template>
</template>

<script setup lang="ts">
const props = defineProps({
  extraInfo: {
    type: Array as PropType<GSK_INFO_VIEWER[]>,
    required: true,
  },
  editable: {
    type: Boolean,
    required: false,
    default: false,
  },
  type: {
    type: String as PropType<'GSK_TIMELINE' | 'GSK_EVENT' | 'GSK_DOCUMENT' | 'GSK_ACTIVITY'>,
    required: true,
  },
  elementId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  hidden: {
    type: Boolean,
    required: false,
    default: false,
  },
});

import MainElement from 'src/components/InfoViewer/MainElement.vue';

import type { GSK_INFO_VIEWER } from 'src/services/library/types/structures/users';
import { type PropType } from 'vue';
import { useSocketStore } from 'src/stores/socket-store';
import type { GSK_CS_UPDATE_EXTRA_INFO } from 'src/services/library/types/data-transfer/users';

const socketStore = useSocketStore();

const updateExtraInfo = (newInfo: GSK_INFO_VIEWER[]) => {
  if (!props.elementId || !props.type || !props.userId) return;
  const payload: GSK_CS_UPDATE_EXTRA_INFO = {
    id: 'GSK_CS_UPDATE_EXTRA_INFO',
    payload: {
      userId: props.userId,
      type: props.type,
      elementId: props.elementId,
      extraInfo: newInfo,
    },
  };
  socketStore.emit('GSK_CS_UPDATE_EXTRA_INFO', payload);
};
</script>
