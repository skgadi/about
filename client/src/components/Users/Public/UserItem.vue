<template>
  <q-item :to="`/v/${user.username}`" clickable v-ripple style="border-radius: 16px">
    <q-item-section avatar>
      <profile-pic :user-id="user.id" :size="'md'" />
    </q-item-section>
    <q-item-section>
      <q-item-label>{{ user.displayName || user.name || 'Unnamed User' }}</q-item-label>
      <q-item-label caption lines="3">{{ user.username }}</q-item-label>
    </q-item-section>
  </q-item>
</template>
<script setup lang="ts">
import ProfilePic from 'src/components/Users/ViewEdit/Elements/ProfilePic.vue';

import type { GSK_USER_PUBLIC_SUMMARY } from 'src/services/library/types/structures/users';

defineProps<{
  user: GSK_USER_PUBLIC_SUMMARY;
}>();
</script>
