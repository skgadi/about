<template>
  <q-expansion-item
    class="shadow-1 overflow-hidden"
    style="border-radius: 30px"
    icon="mdi-file-document-multiple-outline"
    label="Documents"
    header-class="bg-primary text-white"
    expand-icon-class="text-white"
    expand-icon-toggle
    default-opened
    v-model="isDocViewExpanded"
  >
    <template v-slot:header>
      <q-item-section avatar>
        <q-icon name="mdi-file-document-multiple-outline" />
      </q-item-section>
      <q-item-section>
        <div class="row items-center">
          <div class="text-h6">Documents</div>
        </div>
      </q-item-section>
      <q-item-section side top>
        <div>
          <q-btn
            flat
            round
            dense
            :icon="isDocView ? 'mdi-window-restore' : 'mdi-window-maximize'"
            :to="{ name: suggestToLink }"
            class="text-white"
          />
        </div>
      </q-item-section>
    </template>
    <q-input
      dense
      filled
      v-model="search"
      placeholder="Search"
      class="bg-blue-1"
      clearable
      clear-icon="mdi-close"
    >
      <template v-slot:prepend>
        <q-icon name="mdi-magnify" />
      </template>
    </q-input>
    <q-list bordered separator>
      <q-expansion-item
        expand-icon-toggle
        expand-separator
        icon="mdi-file-document-plus-outline"
        label="Add new document"
        v-if="editable"
      >
        <q-card>
          <q-card-section>
            <upload-element />
          </q-card-section>
        </q-card>
      </q-expansion-item>
      <template v-for="(item, idx) in filteredDocuments" :key="idx">
        <document-item :document="item" :editable="editable" />
      </template>
    </q-list>
  </q-expansion-item>
</template>
<script setup lang="ts">
const props = defineProps({
  selectedUser: {
    type: [Object, null] as PropType<GSK_USER_PUBLIC_DETAILS | GSK_USER_SELF_DETAILS | null>,
    required: true,
    default: null,
  },
  editable: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const isDocViewExpanded = defineModel('defaultExpanded', {
  type: Boolean,
  required: false,
  default: false,
});

import UploadElement from 'src/components/Uploads/UploadElement.vue';
import DocumentItem from 'src/components/Users/ViewEdit/Documents/DocumentItem.vue';

import type {
  GSK_USER_PUBLIC_DETAILS,
  GSK_USER_SELF_DETAILS,
} from 'src/services/library/types/structures/users';
import { ref, computed, type PropType } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const search = ref('');

const filteredDocuments = computed(() => {
  const allDocuments = props.selectedUser?.details?.documents || [];
  if (!search.value || search.value.trim() === '') {
    return allDocuments;
  }
  const searchLower = search.value.toLowerCase();
  return (
    allDocuments.filter((doc) => {
      return (
        (doc.id && doc.id.toLowerCase().includes(searchLower)) ||
        doc?.metaInfo?.title?.toLowerCase()?.includes(searchLower) ||
        doc?.metaInfo?.subtitle?.toLowerCase()?.includes(searchLower) ||
        doc?.metaInfo?.description?.toLowerCase()?.includes(searchLower)
      );
    }) || []
  );
});

const isDocView = computed(
  () => route.name === 'edit-documents' || route.name === 'view-documents',
);

const suggestToLink = computed(() => {
  const isEdit = route.name === 'edit-documents' || route.name === 'edit-profile';
  if (isDocView.value) {
    return isEdit ? 'edit-profile' : 'view-profile';
  } else {
    return isEdit ? 'edit-documents' : 'view-documents';
  }
});
</script>
