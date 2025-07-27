<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> {{ settingsStore.appName }} </q-toolbar-title>

        <div>Hi</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Essential Links </q-item-label>
      </q-list>
    </q-drawer>

    <q-page-container>
      <UpdateRibbon ref="updateRibbon" />
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import UpdateRibbon from 'components/Generic/UpdateRibbon.vue';
import { useSettingsStore } from 'src/stores/settings-store';
import { useSocketStore } from 'src/stores/socket-store';

const settingsStore = useSettingsStore();
const socketStore = useSocketStore();

onMounted(async () => {
  //console.log('DesktopLayout mounted');
  await socketStore.initializeSocket();
});

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>
