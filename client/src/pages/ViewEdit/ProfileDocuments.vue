<template>
  <div class="q-py-lg" style="max-width: 800px; width: 100%; margin: auto">
    <template v-if="isEditable">
      <auth-for-full-details
        :user-id="usersStore.getUserIdFromUrlId(route.params.urlUserId as string)"
      >
        <documents-frame :selected-user="selectedUser" :default-expanded="true" editable />
      </auth-for-full-details>
    </template>
    <template v-else>
      <documents-frame :selected-user="selectedUser" :default-expanded="true" />
    </template>
  </div>
</template>
<script setup lang="ts">
import AuthForFullDetails from 'src/components/Auth/AuthForFullDetails.vue';
import DocumentsFrame from 'src/components/Users/ViewEdit/Documents/DocumentsFrame.vue';

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
  if (isEditable.value) {
    if (usersStore.fullUserId === userId && authStore.isAuthorizedToEdit(userId)) {
      return usersStore.userFullDetails;
    }
  } else {
    if (usersStore.publicUserId === userId) {
      return usersStore.userPublicDetails;
    }
  }
  return null;
});

const isEditable = computed(() => route.name === 'edit-documents');
</script>
