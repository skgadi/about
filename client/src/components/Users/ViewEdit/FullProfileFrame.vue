<template>
  <template v-if="editable">
    <auth-for-full-details
      :user-id="usersStore.getUserIdFromUrlId(route.params.urlUserId as string)"
    >
      <full-profile :editable="true" :selected-user="selectedUser" />
    </auth-for-full-details>
  </template>
  <template v-else>
    <full-profile :editable="false" :selected-user="selectedUser" />
  </template>
</template>

<script setup lang="ts">
const props = defineProps({
  editable: {
    type: Boolean,
    required: false,
    default: false,
  },
});

import AuthForFullDetails from 'src/components/Auth/AuthForFullDetails.vue';
import FullProfile from 'src/components/Users/ViewEdit/FullProfile.vue';

import { useAuthStore } from 'src/stores/auth-store';
import { useUsersStore } from 'src/stores/users-store';
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const authStore = useAuthStore();
const usersStore = useUsersStore();
const route = useRoute();

const selectedUser = computed(() => {
  const userId = usersStore.getUserIdFromUrlId(route.params.urlUserId as string);
  if (!userId) return null;
  if (props.editable) {
    if (usersStore.fullUserId === userId && authStore.isAuthorizedToEdit(userId)) {
      return usersStore.userFullDetails;
    }
  } else {
    console.log('Determining selected user for ID:', userId, typeof userId);
    console.log('Public User ID:', usersStore.publicUserId, typeof usersStore.publicUserId);
    if (usersStore.publicUserId === userId) {
      return usersStore.userPublicDetails;
    }
  }
  return null;
});
</script>
