<template>
  <q-avatar
    :style="isEditable ? 'cursor: pointer;' : ''"
    :to="isEditable ? '/profile/edit' : null"
    v-ripple
  >
    <img :src="profilePicUrl" alt="Profile Picture" />
  </q-avatar>
</template>
<script setup lang="ts">
const props = defineProps<{ userId?: string }>();

import { useUsersStore } from 'src/stores/users-store';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import defaultAvatar from 'src/assets/images/default-avatar.png';

const usersStore = useUsersStore();
const route = useRoute();
const userId = computed(() => {
  return props.userId || usersStore.getUserIdFromUrlId(route.params.urlUserId as string) || '';
});

const isEditable = computed(() => {
  if (!userId.value) return false;
  return usersStore.fullUserId === userId.value;
});

const profilePicUrl = computed(() => {
  if (!userId.value) return defaultAvatar;
  return usersStore.listOfUsers.find((u) => u.id === userId.value)?.avatarUrl || defaultAvatar;
});
</script>
