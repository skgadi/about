<template>
  <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
    <q-input
      outlined
      rounded
      dense
      label="Email"
      type="email"
      v-model="email"
      :rules="[
        (val) => !!val || 'Email is required',
        (val) => /.+@.+\..+/.test(val) || 'Email must be valid',
      ]"
    />
    <q-input
      outlined
      rounded
      dense
      label="Password"
      v-model="password"
      :rules="[(val) => !!val || 'Password is required']"
      :type="showPassword ? 'text' : 'password'"
    >
      <template v-slot:append>
        <q-icon
          :name="showPassword ? 'visibility_off' : 'visibility'"
          class="cursor-pointer"
          @click="showPassword = !showPassword"
        />
      </template>
    </q-input>
    <div class="row justify-evenly">
      <q-btn
        class="q-px-md"
        push
        dense
        rounded
        no-caps
        type="submit"
        label="Sign In"
        color="primary"
      />
      <q-btn
        class="q-px-md"
        push
        dense
        rounded
        no-caps
        type="reset"
        label="Reset"
        color="secondary"
      />
    </div>
  </q-form>
</template>

<script setup lang="ts">
import type { GSK_CS_AUTH_SIGN_IN } from 'src/services/library/types/data-transfer/auth';

import { ref } from 'vue';
import { useSocketStore } from 'src/stores/socket-store';

const socketStore = useSocketStore();

const email = ref('');
const password = ref('');
const showPassword = ref(false);

const onSubmit = () => {
  const payload: GSK_CS_AUTH_SIGN_IN = {
    id: 'GSK_CS_AUTH_SIGN_IN',
    payload: {
      email: email.value,
      password: password.value,
    },
  };
  socketStore.emit('GSK_CS_AUTH_SIGN_IN', payload);
};

const onReset = () => {
  email.value = '';
  password.value = '';
};
</script>
