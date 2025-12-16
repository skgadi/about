<template><div></div></template>
<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useUsersStore } from 'src/stores/users-store';
import { useSocketStore } from 'src/stores/socket-store';
import { useAuthStore } from 'src/stores/auth-store';
import type {
  GSK_CS_USER_PUBLIC_DETAILS_REQUEST,
  GSK_CS_USER_SELF_DETAILS_REQUEST,
} from 'src/services/library/types/data-transfer/users';
import { computed, onMounted, watch } from 'vue';

const route = useRoute();
const usersStore = useUsersStore();
const socketStore = useSocketStore();
const authStore = useAuthStore();

const isEditableView = computed(() => {
  switch (route.name) {
    case 'edit-profile':
      return true;
    case 'edit-documents':
      return true;
    default:
      return false;
  }
});

onMounted(() => {
  requestUserDetails();
});

watch(
  () => [route.params.urlUserId, usersStore.listOfUsers],
  () => {
    requestUserDetails();
  },
);

const requestUserDetails = () => {
  const userId = usersStore.getUserIdFromUrlId(route.params.urlUserId as string);
  if (!userId) return;
  if (isEditableView.value && authStore.isAuthorizedToEdit(userId)) {
    const payload: GSK_CS_USER_SELF_DETAILS_REQUEST = {
      id: 'GSK_CS_USER_SELF_DETAILS_REQUEST',
      payload: { userId: userId },
    };
    socketStore.emit('GSK_CS_USER_SELF_DETAILS_REQUEST', payload);
  } else {
    const payload: GSK_CS_USER_PUBLIC_DETAILS_REQUEST = {
      id: 'GSK_CS_USER_PUBLIC_DETAILS_REQUEST',
      payload: { userId: userId },
    };

    socketStore.emit('GSK_CS_USER_PUBLIC_DETAILS_REQUEST', payload);
  }
};
</script>
