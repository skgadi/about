<template>
  <text-field
    :htmlText="htmlText"
    :editable="editable"
    :userId="userId"
    :allowEmpty="allowEmpty"
    :hoverText="hoverText"
    :thisStyle="thisStyle"
    :thisClass="thisClass"
    @updated-text="emitToServer"
  />
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

import TextField from 'src/components/Users/ViewEdit/Elements/TextField.vue';

import { useSocketStore } from 'src/stores/socket-store';
import type { GSK_CS_USER_ROOT_FIELD } from 'src/services/library/types/data-transfer/user-root';
const socketStore = useSocketStore();

const emitToServer = (newText: string) => {
  if (props.allowEmpty === false && (!newText || newText.trim() === '')) {
    return;
  }
  // Check if it has changed
  if (newText.trim() === props.htmlText.trim()) {
    return;
  }
  // Emit to server
  const payload: GSK_CS_USER_ROOT_FIELD = {
    id: 'GSK_CS_USER_ROOT_FIELD',
    payload: {
      userId: props.userId,
      fieldName: props.fieldToUpdate,
      fieldValue: newText,
    },
  };
  socketStore.emit('GSK_CS_USER_ROOT_FIELD', payload);
};
</script>
