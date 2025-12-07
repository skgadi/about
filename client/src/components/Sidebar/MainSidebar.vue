<template>
  <q-list>
    <q-item v-for="link in links" :key="link.to" :to="link.to" exact clickable>
      <q-item-section avatar>
        <q-icon :name="link.icon" />
      </q-item-section>
      <q-item-section>{{ link.label }}</q-item-section>
    </q-item>
  </q-list>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from 'src/stores/auth-store';

const authStore = useAuthStore();

const links = computed(() => {
  const output = [{ to: '/', label: 'Home', icon: 'mdi-home-outline' }];
  if (authStore.isSignedIn) {
    output.push(
      {
        to: `/e/${authStore.userDetails?.id}`,
        label: 'Edit profile',
        icon: 'mdi-account-edit-outline',
      },
      {
        to: `/v/${authStore.userDetails?.id}`,
        label: 'Public profile',
        icon: 'mdi-account-outline',
      },
      { to: `/s/${authStore.userDetails?.id}`, label: 'Settings', icon: 'mdi-cog-outline' },
      { to: '/sign-out', label: 'Sign Out', icon: 'mdi-logout' },
    );
  } else {
    output.push(
      { to: '/sign-in', label: 'Sign In', icon: 'mdi-login' },
      { to: '/sign-up', label: 'Register', icon: 'mdi-account-plus-outline' },
      { to: '/forgot-password', label: 'Forgot Password', icon: 'mdi-help-circle-outline' },
      { to: '/reset-password', label: 'Reset Password', icon: 'mdi-lock-reset' },
    );
  }
  output.push({ to: '/about', label: 'About', icon: 'mdi-information-outline' });
  return output;
});
</script>
