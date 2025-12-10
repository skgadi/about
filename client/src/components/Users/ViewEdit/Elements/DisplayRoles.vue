<template>
  <div class="row items-center q-gutter-sm flex-wrap justify-center">
    <template v-for="role in roles" :key="role">
      <q-chip
        class="q-mr-sm q-mb-sm bg-purple-1 text-purple-9"
        :outline="editable"
        dense
        :removable="editable"
        @remove="removeARole(role)"
        icon-remove="mdi-trash-can-outline"
      >
        <text-field
          :editable="editable"
          :html-text="role"
          :user-id="userId"
          :idx="roles.indexOf(role)"
          @updated-text="emitAnEditToServer"
        />
      </q-chip>
    </template>
    <q-btn
      v-if="editable"
      size="xs"
      class="q-ma-sm"
      dense
      flat
      round
      color="primary"
      text-color="primary"
      icon="mdi-plus"
      @click="addARole"
    />
  </div>
</template>
<script setup lang="ts">
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

import TextField from 'src/components/Users/ViewEdit/Elements/TextField.vue';

import type { PropType } from 'vue';
import { useSocketStore } from 'src/stores/socket-store';
import type { GSK_CS_USER_ROOT_FIELD } from 'src/services/library/types/data-transfer/user-root';

const socketStore = useSocketStore();

const emitAnEditToServer = (newText: string, idx: number) => {
  if (!newText || newText.trim() === '') {
    return;
  }
  // The newText should not exist already in roles
  if (props.roles.includes(newText) && props.roles[idx] !== newText) {
    return;
  }
  // Update the roles array
  const updatedRoles = [...props.roles];
  updatedRoles[idx] = newText;
  // Emit to server
  const payload: GSK_CS_USER_ROOT_FIELD = {
    id: 'GSK_CS_USER_ROOT_FIELD',
    payload: {
      userId: props.userId,
      fieldName: 'roles',
      fieldValue: JSON.stringify(updatedRoles),
    },
  };
  socketStore.emit('GSK_CS_USER_ROOT_FIELD', payload);
};

const addARole = () => {
  // add a new role with default name 'New Role'
  // Make sure 'New Role' does not already exist
  if (props.roles.includes('New Role')) {
    return;
  }

  const updatedRoles = [...props.roles, 'New Role'];
  const payload: GSK_CS_USER_ROOT_FIELD = {
    id: 'GSK_CS_USER_ROOT_FIELD',
    payload: {
      userId: props.userId,
      fieldName: 'roles',
      fieldValue: JSON.stringify(updatedRoles),
    },
  };
  socketStore.emit('GSK_CS_USER_ROOT_FIELD', payload);
};

const removeARole = (roleToRemove: string) => {
  const updatedRoles = props.roles.filter((r) => r !== roleToRemove);
  const payload: GSK_CS_USER_ROOT_FIELD = {
    id: 'GSK_CS_USER_ROOT_FIELD',
    payload: {
      userId: props.userId,
      fieldName: 'roles',
      fieldValue: JSON.stringify(updatedRoles),
    },
  };
  socketStore.emit('GSK_CS_USER_ROOT_FIELD', payload);
};
</script>
