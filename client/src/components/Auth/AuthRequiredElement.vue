<template>
  <template v-if="authStore.isSignedIn">
    <slot />
  </template>
  <template v-else>
    <template v-if="authStore.isSignedIn"> </template>
    <template v-else>
      <template v-if="$slots.onDenied">
        <slot name="onDenied" />
      </template>
      <template v-else>
        <q-page class="row items-center justify-evenly">
          <div class="q-pa-md text-center" style="width: 350px">
            <div class="text-bold">Access Denied</div>
            <q-btn class="q-mt-sm" push rounded no-caps label="Sign in now" color="primary">
              <q-menu>
                <div class="q-pa-md" style="width: 300px">
                  <sign-in-form />
                </div>
              </q-menu>
            </q-btn>
          </div>
        </q-page>
      </template>
    </template>
  </template>
</template>
<script setup lang="ts">
import SignInForm from 'src/components/Auth/SignInForm.vue';

import { useAuthStore } from 'src/stores/auth-store';

const authStore = useAuthStore();
</script>
