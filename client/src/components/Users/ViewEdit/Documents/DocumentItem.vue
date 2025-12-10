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
        <div class="text-bold">
          <text-field
            :html-text="document?.metaInfo?.title || ''"
            :editable="editable"
            :idx="idx"
            field-to-update="title"
          />
        </div>
        <div class="text-subtitle2">
          <text-field
            :html-text="document?.metaInfo?.subtitle || ''"
            :editable="editable"
            :idx="idx"
            field-to-update="subtitle"
          />
        </div>
        <div class="text-body2 text-weight-light">
          <text-field
            :html-text="document?.metaInfo?.description || ''"
            :editable="editable"
            :idx="idx"
            field-to-update="description"
          />
        </div>
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
          />
        </div>
      </q-item-section>
    </template>
    <q-card>
      <q-card-section>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quidem, eius reprehenderit eos
        corrupti commodi magni quaerat ex numquam, dolorum officiis modi facere maiores architecto
        suscipit iste eveniet doloribus ullam aliquid.
      </q-card-section>
    </q-card>
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

import TextField from 'src/components/Users/ViewEdit/Elements/TextField.vue';

import { computed, type PropType } from 'vue';
import type { GSK_DOCUMENT } from 'src/services/library/types/structures/users';
import { fileIconFromMimeType } from 'src/services/utils/file';
import { downloadADocument } from 'src/services/utils/url';
import { useUsersStore } from 'src/stores/users-store';
import { useRoute } from 'vue-router';

const usersStore = useUsersStore();
const route = useRoute();

const docIcon = computed(() => {
  // Determine icon based on document type or other properties
  return fileIconFromMimeType(props.document.mimeType);
});

const userId = computed(() => {
  return usersStore.getUserIdFromUrlId(route.params.urlUserId as string);
});
</script>
