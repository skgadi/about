<template>
  <list-of-strings
    :strings="names"
    :editable="editable"
    this-class="bg-teal-1 text-teal-9"
    new-string-name="New name"
    @updated-strings="(strings: string[]) => emitUpdate(strings)"
  />
</template>
<script lang="ts" setup>
const props = defineProps({
  names: {
    type: Array as PropType<string[]>,
    required: true,
    default: () => [],
  },
  editable: {
    type: Boolean,
    required: false,
    default: false,
  },
  userId: {
    type: String,
    required: true,
    default: '',
  },
});

import ListOfStrings from 'src/components/Users/ViewEdit/Meta/ListOfStrings.vue';

import type { PropType } from 'vue';
import { useSocketStore } from 'src/stores/socket-store';
import type { GSK_CS_USER_ROOT_FIELD } from 'src/services/library/types/data-transfer/user-root';

const socketStore = useSocketStore();

const emitUpdate = (strings: string[]) => {
  const payload: GSK_CS_USER_ROOT_FIELD = {
    id: 'GSK_CS_USER_ROOT_FIELD',
    payload: {
      userId: props.userId,
      fieldName: 'names',
      fieldValue: JSON.stringify(strings),
    },
  };
  socketStore.emit('GSK_CS_USER_ROOT_FIELD', payload);
};
</script>
