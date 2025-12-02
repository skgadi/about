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
  if (authStore.isSignedIn) {
    return [
      { to: '/', label: 'Home', icon: 'home' },
      { to: '/my-profile', label: 'Profile', icon: 'person' },
      { to: '/my-settings', label: 'Settings', icon: 'settings' },
      { to: '/sign-out', label: 'Sign Out', icon: 'logout' },
      { to: '/about', label: 'About', icon: 'info' },
    ];
  } else {
    return [
      { to: '/', label: 'Home', icon: 'home' },
      { to: '/sign-in', label: 'Sign In', icon: 'login' },
      { to: '/sign-up', label: 'Register', icon: 'person_add' },
      { to: '/forgot-password', label: 'Forgot Password', icon: 'help' },
      { to: '/reset-password', label: 'Reset Password', icon: 'lock_reset' },
      { to: '/about', label: 'About', icon: 'info' },
    ];
  }
});
</script>
