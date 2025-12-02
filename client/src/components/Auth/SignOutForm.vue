<template>
  <q-form @submit.prevent="onSubmit" @reset.prevent="onReset">
    <div class="text-center q-mb-md">Are you sure you want to sign out?</div>
    <div class="row justify-center q-mb-md">
      <q-btn
        class="q-px-md"
        push
        dense
        rounded
        no-caps
        type="submit"
        label="Sign Out"
        color="primary"
      />
    </div>
  </q-form>
</template>
<script setup lang="ts">
import type { GSK_CS_AUTH_SIGN_OUT } from 'src/services/library/types/data-transfer/auth';
import { useSocketStore } from 'src/stores/socket-store';
const socketStore = useSocketStore();

const onSubmit = () => {
  const payload: GSK_CS_AUTH_SIGN_OUT = {
    id: 'GSK_CS_AUTH_SIGN_OUT',
    payload: {},
  };
  socketStore.emit('GSK_CS_AUTH_SIGN_OUT', payload);
};

const onReset = () => {
  // No reset logic needed for sign out form
};
</script>
