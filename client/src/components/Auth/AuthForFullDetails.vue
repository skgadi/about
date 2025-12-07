<template>
  <template v-if="isAuthUserAndFullDetailsLoaded">
    <slot />
  </template>
  <template v-else>
    <template v-if="$slots.onDenied">
      <slot name="onDenied" />
    </template>
    <template v-else>
      <q-page class="row items-center justify-evenly">
        <div class="q-pa-md text-center" style="width: 350px">
          <div class="text-bold">Access Denied</div>
          <q-btn class="q-mt-sm" push rounded no-caps label="Sign in now" color="primary">
            <q-menu>
              <div class="q-pa-md" style="width: 300px">
                <sign-in-form />
              </div>
            </q-menu>
          </q-btn>
        </div>
      </q-page>
    </template>
  </template>
</template>
<script setup lang="ts">
const props = defineProps<{
  userId: string;
  isSuperAdminView?: boolean;
}>();

import SignInForm from 'src/components/Auth/SignInForm.vue';

import { useAuthStore } from 'src/stores/auth-store';
import { useUsersStore } from 'src/stores/users-store';
import { computed } from 'vue';

const authStore = useAuthStore();
const usersStore = useUsersStore();

const isAuthUserAndFullDetailsLoaded = computed(() => {
  if (!props.userId) return false;
  if (!authStore.isSignedIn) return false;
  if (!usersStore.userFullDetails) return false;
  if (props.userId !== usersStore.userFullDetails.id) return false;
  if (!authStore?.userDetails) return false;
  if (props.isSuperAdminView && !authStore.userDetails.isSuperAdmin) return false;

  if (authStore?.userDetails?.id === usersStore.userFullDetails.id) return true;
  if (authStore.userDetails.isAdmin) return true;
  if (authStore.userDetails.isSuperAdmin) return true;
  return false;
});
</script>
