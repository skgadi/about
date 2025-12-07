<template>
  <q-avatar
    :style="isEditable ? 'cursor: pointer;' : ''"
    :size="size"
    v-ripple
    @click="(evt: Event) => (isEditable ? ($refs?.inputForFile as QFile)?.pickFiles(evt) : null)"
  >
    <img :src="profilePicUrl" alt="Profile Picture" />
  </q-avatar>
  <q-file
    ref="inputForFile"
    v-if="isEditable"
    v-show="false"
    style="max-width: 300px"
    v-model="imageFile"
    filled
    rounded
    label="Restricted to image"
    accept=".jpg, image/*"
    @change="onFileChange"
  />
</template>
<script setup lang="ts">
const props = defineProps({
  userId: {
    type: String,
    required: false,
    default: '',
  },
  editable: {
    type: Boolean,
    required: false,
    default: false,
  },
  size: {
    type: String,
    required: false,
    default: 'md',
  },
});

import { useUsersStore } from 'src/stores/users-store';
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useSocketStore } from 'src/stores/socket-store';
import defaultAvatar from 'src/assets/images/default-avatar.png';
import { fileTo128DataUrl } from 'src/services/utils/image-resize';
import type { QFile } from 'quasar';
import type { GSK_CS_USER_ROOT_PIC } from 'src/services/library/types/data-transfer/user-root';

const inputForFile = ref<QFile>();

const usersStore = useUsersStore();
const socketStore = useSocketStore();
const route = useRoute();
const userId = computed(() => {
  return props.userId || usersStore.getUserIdFromUrlId(route.params.urlUserId as string) || '';
});

const isEditable = computed(() => {
  if (!userId.value) return false;

  return usersStore.fullUserId === userId.value && props.editable;
});

const profilePicUrl = computed(() => {
  if (!userId.value) return defaultAvatar;
  return usersStore.listOfUsers.find((u) => u.id === userId.value)?.avatarUrl || defaultAvatar;
});

// For handling file upload
const imageFile = ref<File | null>(null);

watch(imageFile, async () => {
  await onFileChange();
});

const onFileChange = async () => {
  if (!imageFile.value) return;
  // Handle the file upload logic here
  const dataUrl = await fileTo128DataUrl(imageFile.value);
  const payload: GSK_CS_USER_ROOT_PIC = {
    id: 'GSK_CS_USER_ROOT_PIC',
    payload: {
      userId: userId.value,
      avatarUrl: dataUrl,
    },
  };
  socketStore.emit('GSK_CS_USER_ROOT_PIC', payload);
  imageFile.value = null;
  console.log('Profile pic upload emitted');
};
</script>
