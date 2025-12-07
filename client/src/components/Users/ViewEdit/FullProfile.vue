<template>
  <div style="max-width: 500px; margin: auto">
    <template v-if="selectedUser">
      <div class="q-pa-md text-center">
        <profile-pic :editable="editable" size="128px" />
        <div class="text-h6 q-mt-sm">
          {{ selectedUser.displayName || selectedUser.name || 'Unnamed User' }}
        </div>
        <div class="text-caption">@{{ selectedUser.username }}</div>
      </div>
      <div class="q-pa-md" style="width: 400px">
        <upload-element />
      </div>
    </template>
    <template v-else>
      <div class="text-center" style="padding-top: 64px">
        <q-spinner-facebook color="primary" size="3em" />
        <br />
        <span class="text-caption">Loading profile ...</span>
        {{ typeof selectedUser }}
        {{ selectedUser === null }}
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    editable: boolean; // Optional (because of ?)
    selectedUser: GSK_USER_PUBLIC_DETAILS | GSK_USER_SELF_DETAILS | null; // Required (no ?)
  }>(),
  {
    editable: false, // Default value
  },
);

import ProfilePic from 'src/components/Users/ViewEdit/Elements/ProfilePic.vue';
import UploadElement from 'src/components/Uploads/UploadElement.vue';

import { useUsersStore } from 'src/stores/users-store';
import { useSocketStore } from 'src/stores/socket-store';
import { useRoute } from 'vue-router';
import { defineProps, onMounted, watch } from 'vue';
import type {
  GSK_USER_PUBLIC_DETAILS,
  GSK_USER_SELF_DETAILS,
} from 'src/services/library/types/structures/users';
import type {
  GSK_CS_USER_PUBLIC_DETAILS_REQUEST,
  GSK_CS_USER_SELF_DETAILS_REQUEST,
} from 'src/services/library/types/data-transfer/users';

const usersStore = useUsersStore();
const socketStore = useSocketStore();
const route = useRoute();

watch(
  () => [props.selectedUser, usersStore.listOfUsers],
  () => {
    if (props.selectedUser) {
      return;
    }
    requestUserDetails();
  },
);

onMounted(() => {
  if (props.selectedUser) {
    return;
  }
  requestUserDetails();
});

const requestUserDetails = () => {
  const userId = usersStore.getUserIdFromUrlId(route.params.urlUserId as string);
  if (!userId) return;
  console.log('requesting user details');
  if (props.editable) {
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
    console.log('emitting public details request for', userId);
    socketStore.emit('GSK_CS_USER_PUBLIC_DETAILS_REQUEST', payload);
  }
};
</script>
