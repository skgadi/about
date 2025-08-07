<template>
  <div>
    <h1>About Us</h1>
    <p>Version: {{ settingsStore.constants.appVersion }}</p>
    <p>Welcome to the About page!</p>
  </div>
</template>
<script setup lang="ts">
import { useSettingsStore } from 'src/stores/settings-store';

const settingsStore = useSettingsStore();
</script>
