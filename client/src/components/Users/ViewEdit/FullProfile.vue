<template>
  <div class="q-py-lg" style="max-width: 800px; width: 100%; margin: auto">
    <template v-if="selectedUser">
      <div class="text-center">
        <profile-pic :editable="editable" size="128px" />
        <div class="text-h6 q-mt-sm">
          <root-text-field
            :html-text="selectedUser.displayName || selectedUser.name || 'Unnamed User'"
            :editable="editable"
            field-to-update="displayName"
            :user-id="selectedUser.id"
            this-class="text-h6"
          />
        </div>
        <div class="text-caption">
          <span>@</span>
          <root-text-field
            :html-text="selectedUser.userName || 'no-userName'"
            :editable="editable"
            field-to-update="userName"
            :user-id="selectedUser.id"
            this-class="text-caption"
          />
        </div>
        <div class="text-caption" v-if="(selectedUser as GSK_USER_SELF_DETAILS)?.email">
          {{ (selectedUser as GSK_USER_SELF_DETAILS)?.email || 'no-email' }}
        </div>
        <display-roles
          :roles="selectedUser.roles || []"
          :editable="editable"
          :user-id="selectedUser.id"
        />
      </div>
      <documents-frame :selected-user="selectedUser" :editable="editable" />
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
const props = defineProps({
  editable: {
    type: Boolean,
    required: false,
    default: false,
  },
  selectedUser: {
    type: [Object, null] as PropType<GSK_USER_PUBLIC_DETAILS | GSK_USER_SELF_DETAILS | null>,
    required: true,
    default: null,
  },
});

import DocumentsFrame from 'src/components/Users/ViewEdit/Documents/DocumentsFrame.vue';
import DisplayRoles from 'src/components/Users/ViewEdit/Elements/DisplayRoles.vue';
import RootTextField from 'src/components/Users/ViewEdit/Elements/RootTextField.vue';
import ProfilePic from 'src/components/Users/ViewEdit/Elements/ProfilePic.vue';

import { useUsersStore } from 'src/stores/users-store';
import { useSocketStore } from 'src/stores/socket-store';
import { useRoute } from 'vue-router';
import type { PropType } from 'vue';
import { onMounted, watch } from 'vue';
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

    socketStore.emit('GSK_CS_USER_PUBLIC_DETAILS_REQUEST', payload);
  }
};
</script>
