<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          <q-item>
            <q-item-section>
              <div class="text-bold text-body1">{{ settingsStore.constants.appName }}</div>
              <q-breadcrumbs
                class="text-caption"
                active-color="blue-2"
                v-if="breadcrumbs.length > 0"
              >
                <template v-slot:separator>
                  <q-icon size="1.5em" name="mdi-chevron-right" color="green" />
                </template>
                <q-breadcrumbs-el
                  v-for="(crumb, index) in breadcrumbs"
                  :key="index"
                  :label="String(crumb)"
                />
              </q-breadcrumbs>
              <div v-else class="text-caption">
                Version {{ settingsStore.constants.appVersion }}
              </div>
            </q-item-section>
          </q-item>
        </q-toolbar-title>

        <connectivity-indicator />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      :width="drawerWidth"
      :style="drawerStyle"
      show-if-above
      bordered
    >
      <!--Drawer content starts here-->
      <main-sidebar />
      <!--Drawer content ends here-->
      <!-- Resize handle -->
      <div class="resize-handle" @mousedown="startResize" />
    </q-drawer>

    <q-page-container>
      <update-ribbon ref="updateRibbon" />
      <cookies-consent />
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import UpdateRibbon from 'components/Generic/UpdateRibbon.vue';
import ConnectivityIndicator from 'src/components/Generic/ConnectivityIndicator.vue';
import CookiesConsent from 'src/components/Generic/CookiesConsent.vue';
import MainSidebar from 'src/components/Sidebar/MainSidebar.vue';

import { computed, onMounted, ref, watch } from 'vue';
import { useSettingsStore } from 'src/stores/settings-store';
import { useSocketStore } from 'src/stores/socket-store';
import { useUsersStore } from 'src/stores/users-store';
import { useRoute } from 'vue-router';
import { Cookies } from 'quasar';

const settingsStore = useSettingsStore();
const socketStore = useSocketStore();
const usersStore = useUsersStore();
const route = useRoute();

onMounted(async () => {
  //console.log('DesktopLayout mounted');
  await socketStore.initializeSocket();
  document.title = settingsStore.constants.appName;
});

const breadcrumbs = computed(() => {
  const out = [];
  const userDisplayName = usersStore.getUserDisplayNameFromUrlId(route.params.urlUserId as string);
  if (userDisplayName) {
    out.push(userDisplayName);
  }
  switch (route.name) {
    case 'about':
      out.push('About');
      break;
    case 'sign-in':
      out.push('Sign in');
      break;
    case 'sign-up':
      out.push('Register');
      break;
    case 'sign-out':
      out.push('Sign out');
      break;
    case 'forgot-password':
      out.push('Forgot password');
      break;
    case 'reset-password':
      out.push('Reset password');
      break;
    case 'edit-profile':
      out.push('Edit Profile');
      break;
    case 'edit-documents':
      out.push('Edit documents');
      break;
    case 'view-documents':
      out.push('View documents');
      break;
  }

  return out;
});

watch(
  () => breadcrumbs.value,
  () => {
    updateTitle();
  },
);

const updateTitle = () => {
  document.title = `${settingsStore.constants.appName}${
    breadcrumbs.value.length > 0 ? ' - ' + breadcrumbs.value[0] : ''
  }`;
};

// ---- DRAWER -----

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

// --- Resize logic ---
let isResizing = false;
let resizeStartX = 0;
let initialWidth = 0;

const startResize = (e: MouseEvent) => {
  isResizing = true;
  resizeStartX = e.clientX;
  initialWidth = drawerWidth.value;

  document.addEventListener('mousemove', onResize);
  document.addEventListener('mouseup', stopResizeAndDrag);
};

const onResize = (e: MouseEvent) => {
  if (!isResizing) return;
  const delta = e.clientX - resizeStartX;
  drawerWidth.value = Math.max(200, Math.min(initialWidth + delta, 600));
};

const leftDrawerOpen = ref(true);
const getInitialDrawerWidth = () => {
  try {
    return parseInt(Cookies.get('MAIN_APP_DRAWER_WIDTH') || '250', 10);
  } catch (error) {
    console.error('Error getting initial drawer width:', error);
    return 250;
  }
};
const drawerWidth = ref(getInitialDrawerWidth());

// --- Drag logic ---
let isDragging = false;
const dragStartX = 0;

const onDrag = (e: MouseEvent) => {
  if (!isDragging) return;
  const dx = e.clientX - dragStartX;
  drawerStyle.value.transform = `translateX(${dx}px)`;
};

const stopResizeAndDrag = () => {
  if (isDragging || isResizing) {
    drawerStyle.value.transform = '';
  }

  isDragging = false;
  isResizing = false;

  document.removeEventListener('mousemove', onResize);
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopResizeAndDrag);
};
const drawerStyle = ref({
  transform: '',
});

// update cookies for drawer width
watch(drawerWidth, (newWidth) => {
  try {
    Cookies.set('MAIN_APP_DRAWER_WIDTH', newWidth.toString());
  } catch (error) {
    console.error('Error setting drawer width cookie:', error);
  }
});
</script>

<style scoped>
.resize-handle {
  position: absolute;
  top: 0;
  right: 0;
  width: 6px;
  height: 100%;
  cursor: ew-resize;
  z-index: 1000;
}
</style>
