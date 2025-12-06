<template>
  <q-page class="row items-center justify-evenly">
    <div class="q-pa-md" style="width: 350px">
      <div class="text-bold text-center q-pb-md">Sign out page</div>
      <sign-out-form />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import SignOutForm from 'src/components/Auth/SignOutForm.vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth-store';
import { watch } from 'vue';

const router = useRouter();
const authStore = useAuthStore();

watch(
  () => [authStore.isSignedIn],
  async ([isSignedIn]) => {
    if (!isSignedIn) {
      await router.push({ name: 'index' });
    }
  },
  { immediate: true },
);
</script>
