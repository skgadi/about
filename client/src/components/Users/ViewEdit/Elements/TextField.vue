<template>
  <span :class="thisClass" :style="thisStyle" v-html="htmlText" />
  <span>
    <template v-if="editable">
      <q-icon name="mdi-pencil-outline" size="16px" class="q-ml-xs" style="cursor: pointer" />
      <template v-if="hoverText">
        <q-tooltip>
          {{ hoverText }}
        </q-tooltip>
      </template>
      <q-popup-edit
        v-model="localHtmlText"
        type="textarea"
        v-slot="scope"
        class="q-py-md"
        style="border-radius: 50px; width: 400px"
      >
        <q-input
          outlined
          rounded
          dense
          v-model="localHtmlText"
          style="min-width: 250px"
          clearable
          clear-icon="mdi-close"
          autofocus
          @keyup.enter="
            () => {
              scope.set();
              emitValue();
            }
          "
        >
          <template v-slot:after>
            <q-btn
              round
              flat
              dense
              color="positive"
              icon="mdi-check-circle-outline"
              @click="
                scope.set();
                emitValue();
              "
              :disable="!allowEmpty && (!localHtmlText || localHtmlText.trim() === '')"
            />
            <q-btn
              round
              flat
              dense
              color="negative"
              icon="mdi-close-circle-outline"
              @click="scope.cancel()"
            />
          </template>
        </q-input>
      </q-popup-edit>
    </template>
  </span>
</template>
<script setup lang="ts">
const props = defineProps({
  htmlText: {
    type: String,
    required: false,
    default: '',
  },
  editable: {
    type: Boolean,
    required: false,
    default: false,
  },
  userId: {
    type: String,
    required: true,
  },
  fieldToUpdate: {
    type: String,
    required: true,
  },
  allowEmpty: {
    type: Boolean,
    required: false,
    default: false,
  },
  hoverText: {
    type: String,
    required: false,
    default: 'Click to edit',
  },
  thisStyle: {
    type: String,
    required: false,
    default: '',
  },
  thisClass: {
    type: String,
    required: false,
    default: '',
  },
});

import { ref, watch } from 'vue';
import { useSocketStore } from 'src/stores/socket-store';
import type { GSK_CS_USER_ROOT_FIELD } from 'src/services/library/types/data-transfer/user-root';

const socketStore = useSocketStore();

const localHtmlText = ref(props.htmlText);
watch(
  () => props.htmlText,
  (newVal) => {
    localHtmlText.value = newVal;
  },
);

const emitValue = () => {
  if (props.allowEmpty === false && (!localHtmlText.value || localHtmlText.value.trim() === '')) {
    return;
  }
  // Check if it has changed
  if (localHtmlText.value.trim() === props.htmlText.trim()) {
    return;
  }
  // Emit to server
  const payload: GSK_CS_USER_ROOT_FIELD = {
    id: 'GSK_CS_USER_ROOT_FIELD',
    payload: {
      userId: props.userId,
      fieldName: props.fieldToUpdate,
      fieldValue: localHtmlText.value,
    },
  };
  socketStore.emit('GSK_CS_USER_ROOT_FIELD', payload);
};
</script>
