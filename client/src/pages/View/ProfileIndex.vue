<template>
  <auth-for-full-details :user-id="usersStore.getUserIdFromUrlId(route.params.urlUserId as string)">
    <div style="max-width: 500px; margin: auto">
      <profile-pic />

      <div class="q-pa-md" style="width: 400px">
        <upload-element />
      </div>
      {{ usersStore.userFullDetails?.details?.documents }}
    </div>
  </auth-for-full-details>
</template>

<script setup lang="ts">
import AuthForFullDetails from 'src/components/Auth/AuthForFullDetails.vue';
import UploadElement from 'src/components/Uploads/UploadElement.vue';
import ProfilePic from 'src/components/Users/ViewEdit/ProfilePic.vue';

import { useUsersStore } from 'src/stores/users-store';
import { useRoute } from 'vue-router';

const usersStore = useUsersStore();
const route = useRoute();
</script>
