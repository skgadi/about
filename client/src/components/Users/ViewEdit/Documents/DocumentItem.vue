<template>
  <q-expansion-item
    expand-icon-toggle
    expand-separator
    :icon="docIcon"
    :label="document.metaInfo.title"
    :caption="document.metaInfo.subtitle"
  >
    <template v-slot:header>
      <q-item-section avatar>
        <q-icon :name="docIcon" />
      </q-item-section>
      <q-item-section>
        <info-viewer
          :meta-info="document?.metaInfo"
          :editable="editable"
          element="documents"
          :element-id="document.id"
          :user-id="userId"
        />
      </q-item-section>
      <q-item-section align="top" side>
        <div>
          <q-btn
            size="sm"
            flat
            round
            dense
            icon="mdi-cloud-download-outline"
            @click="downloadADocument(userId, document.id)"
          />
          <q-btn
            size="sm"
            flat
            round
            dense
            icon="mdi-creation-outline"
            color="primary"
            v-if="editable"
          />
          <q-btn
            size="sm"
            flat
            round
            dense
            icon="mdi-trash-can-outline"
            color="negative"
            v-if="editable"
            @click="deleteADocument(userId, document.id)"
          />
        </div>
      </q-item-section>
    </template>
    <main-page :url="prepareViewerURL(userId, document.id)" :extension="document.extension" />
  </q-expansion-item>
</template>
<script setup lang="ts">
const props = defineProps({
  document: {
    type: Object as PropType<GSK_DOCUMENT>,
    required: true,
    default: () => ({}),
  },
  editable: {
    type: Boolean,
    required: false,
    default: false,
  },
  idx: {
    type: Number,
    required: false,
    default: -1,
  },
});

import InfoViewer from 'src/components/Users/ViewEdit/Meta/InfoViewer.vue';
import MainPage from 'src/components/Users/ViewEdit/Documents/Viewer/MainPage.vue';

import { computed, type PropType } from 'vue';
import type { GSK_DOCUMENT } from 'src/services/library/types/structures/users';
import { fileIconFromMimeType } from 'src/services/utils/file';
import { downloadADocument, prepareViewerURL } from 'src/services/utils/url';
import { useUsersStore } from 'src/stores/users-store';
import { useSocketStore } from 'src/stores/socket-store';
import { useRoute } from 'vue-router';
import type { GSK_CS_DOCUMENT_DELETE_REQUEST } from 'src/services/library/types/data-transfer/documents';

const usersStore = useUsersStore();
const socketStore = useSocketStore();
const route = useRoute();

const docIcon = computed(() => {
  // Determine icon based on document type or other properties
  return fileIconFromMimeType(props.document.mimeType);
});

const userId = computed(() => {
  return usersStore.getUserIdFromUrlId(route.params.urlUserId as string);
});

const deleteADocument = (userId: string, documentId: string) => {
  const confirm = window.confirm('Are you sure you want to delete this document?');
  if (confirm) {
    const payload: GSK_CS_DOCUMENT_DELETE_REQUEST = {
      id: 'GSK_CS_DOCUMENT_DELETE_REQUEST',
      payload: {
        documentId,
        userId,
      },
    };
    socketStore.emit('GSK_CS_DOCUMENT_DELETE_REQUEST', payload);
  }
};
</script>
