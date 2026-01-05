<template>
  <template v-if="editable">
    <div style="height: 400px; max-height: calc(80vh - 100px)">
      <div class="column" style="height: 100%">
        <div class="col-auto">
          <div class="row justify-end q-gutter-sm">
            <q-btn
              size="sm"
              flat
              round
              dense
              :icon="isShowingEditor ? 'mdi-eye-outline' : 'mdi-code-tags'"
              color="primary"
              @click="isShowingEditor = !isShowingEditor"
            >
              <q-tooltip>{{ isShowingEditor ? 'View Mode' : 'Edit Mode' }}</q-tooltip>
            </q-btn>
            <q-btn
              size="sm"
              flat
              round
              dense
              icon="mdi-cancel"
              color="negative"
              v-if="!readonly"
              @click="discardChanges()"
            >
              <q-tooltip>Discard Changes</q-tooltip>
            </q-btn>
            <q-btn
              size="sm"
              flat
              round
              dense
              :icon="readonly ? 'mdi-lock-open-outline' : 'mdi-content-save-outline'"
              :color="readonly ? 'grey' : 'primary'"
              @click="lockSaveButton()"
            >
              <q-tooltip>{{ readonly ? 'Unlock Editor' : 'Lock Editor' }}</q-tooltip>
            </q-btn>
          </div>
        </div>
        <div class="col" style="height: 100%; border-radius: 16px; overflow: hidden">
          <code-editor
            v-if="isShowingEditor"
            v-model:value="code"
            :language="language"
            theme="vs-dark"
            :options="editorOptions"
            style="height: 100%"
          />
          <text-view-index v-else :info-viewer="temporaryInfoViewer" />
        </div>
      </div>
    </div>
  </template>
  <template v-else>
    <text-view-index :info-viewer="infoViewer" />
  </template>
</template>

<script setup lang="ts">
const props = defineProps({
  infoViewer: {
    type: Object as PropType<GSK_INFO_VIEWER>,
    required: true,
  },
  editable: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const emit = defineEmits<{
  (e: 'updated-info', updatedInfo: GSK_INFO_VIEWER): void;
}>();

import TextViewIndex from 'src/components/InfoViewer/Text/TextViewIndex.vue';

import type { GSK_INFO_VIEWER } from 'src/services/library/types/structures/users';
import { computed, type PropType, ref, watch } from 'vue';
import { CodeEditor } from 'monaco-editor-vue3';

const code = ref(props.infoViewer.data || '');
const readonly = ref(true);

const editorOptions = computed(() => {
  return {
    automaticLayout: true,
    minimap: { enabled: true },
    readOnly: readonly.value,
    wordWrap: 'on' as const,
  };
});

const languageMap: Record<string, string> = {
  text: 'plaintext',
  markdown: 'markdown',
  html: 'html',
  latex: 'latex',
  json: 'json',
  xml: 'xml',
  yaml: 'yaml',
  csv: 'csv',
  bibtex: 'plaintext',
};

const language = computed(() => {
  return languageMap[props.infoViewer.typeOfInfo] || 'plaintext';
});

watch(
  () => props.infoViewer.data,
  (newData) => {
    code.value = newData || '';
  },
  { immediate: true },
);

const lockSaveButton = () => {
  readonly.value = !readonly.value;
  if (readonly.value) {
    const updatedInfo: GSK_INFO_VIEWER = {
      ...props.infoViewer,
      data: code.value,
    };
    emit('updated-info', updatedInfo);
  }
};
const discardChanges = () => {
  code.value = props.infoViewer.data || '';
  readonly.value = true;
};

const isShowingEditor = ref(true);

const temporaryInfoViewer = computed<GSK_INFO_VIEWER>(() => {
  return {
    ...props.infoViewer,
    data: code.value,
  };
});
</script>
