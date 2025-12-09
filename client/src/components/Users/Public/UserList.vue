<template>
  <q-input
    v-model="filter"
    outlined
    rounded
    dense
    placeholder="Filter users by name, userName, or ID"
  />

  <br />
  <q-list>
    <template v-for="user in filteredUsers" :key="user.id">
      <user-item v-for="user in filteredUsers" :key="user.id" :user="user" />
    </template>
  </q-list>
</template>
<script setup lang="ts">
import UserItem from 'src/components/Users/Public/UserItem.vue';

import { useUsersStore } from 'src/stores/users-store';
import { computed, ref } from 'vue';

const usersStore = useUsersStore();

const filter = ref<string>('');

const filteredUsers = computed(() => {
  return usersStore.listOfUsers.filter((user) => {
    return (
      user?.displayName?.toLowerCase().includes(filter.value.toLowerCase()) ||
      user?.userName?.toLowerCase().includes(filter.value.toLowerCase()) ||
      user?.id?.toLowerCase().includes(filter.value.toLowerCase()) ||
      user?.name?.toLowerCase().includes(filter.value.toLowerCase())
    );
  });
});
</script>
