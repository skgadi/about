<template>
  <AuthRequiredElement>
    <q-page class="row items-center justify-evenly">
      <div class="q-pa-md" style="width: 400px">
        <upload-element />
      </div>
      {{ usersStore.userFullDetails?.details?.documents }}
    </q-page>
  </AuthRequiredElement>
</template>

<script setup lang="ts">
import AuthRequiredElement from 'src/components/Auth/AuthRequiredElement.vue';
import UploadElement from 'src/components/Uploads/UploadElement.vue';

import { useUsersStore } from 'src/stores/users-store';

const usersStore = useUsersStore();
</script>
