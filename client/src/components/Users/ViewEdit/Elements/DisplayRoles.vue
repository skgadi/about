<template>
  <list-of-strings
    :strings="roles"
    :editable="editable"
    this-class="bg-purple-1 text-purple-9"
    new-string-name="New Role"
    @updated-strings="(strings: string[]) => emitUpdate(strings)"
  />
</template>
<script lang="ts" setup>
const props = defineProps({
  roles: {
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
      fieldName: 'roles',
      fieldValue: JSON.stringify(strings),
    },
  };
  socketStore.emit('GSK_CS_USER_ROOT_FIELD', payload);
};
</script>
