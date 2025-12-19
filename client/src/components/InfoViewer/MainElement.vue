<template>
  <div v-if="editable">
    <text-field
      :editable="editable"
      :select-options="viewerOptions"
      :html-text="infoViewer.typeOfInfo"
      @updated-text="
        (updatedType) => {
          const updatedInfo = { ...infoViewer, typeOfInfo: updatedType };
          emit('updated-info', updatedInfo as GSK_INFO_VIEWER);
        }
      "
    />
  </div>
  <component
    :is="ViewerTypeComponentMap[viewerType]"
    :info-viewer="infoViewer"
    :editable="editable"
    @updated-info="
      (updatedInfo: GSK_INFO_VIEWER) => {
        emit('updated-info', updatedInfo);
      }
    "
  />
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

import TextField from 'src/components/Users/ViewEdit/Elements/TextField.vue';
import type { GSK_QUASAR_OPTION } from 'src/services/library/types/structures/client';

import type { GSK_INFO_VIEWER } from 'src/services/library/types/structures/users';
import { computed, type PropType, type Component, defineAsyncComponent } from 'vue';

const ViewerTypeComponentMap: Record<string, Component> = {
  'text-based': defineAsyncComponent(() => import('src/components/InfoViewer/Text/TextIndex.vue')),
  // Add other viewer types and their corresponding components here
};

const viewerType = computed(() => {
  switch (props.infoViewer.typeOfInfo) {
    case 'text':
    case 'markdown':
    case 'html':
    case 'latex':
    case 'json':
    case 'xml':
    case 'yaml':
    case 'csv':
    case 'bibtex':
    case 'reference':
    case 'diagram_mermaid':
      return 'text-based';
    // Add other cases for different viewer types here
    default:
      return 'text-based'; // Fallback to text-based viewer
  }
});

const viewerOptions: GSK_QUASAR_OPTION[] = [
  {
    label: 'Simple Text',
    value: 'text',
    description: 'Plain text without any formatting',
  },
  {
    label: 'Markdown',
    value: 'markdown',
    description: 'Text formatted using Markdown syntax',
  },
  {
    label: 'HTML',
    value: 'html',
    description: 'Text formatted using HTML tags',
  },
  {
    label: 'LaTeX',
    value: 'latex',
    description: 'Text formatted using LaTeX syntax',
  },
  {
    label: 'JSON',
    value: 'json',
    description: 'JavaScript Object Notation format',
  },
  {
    label: 'XML',
    value: 'xml',
    description: 'eXtensible Markup Language format',
  },
  {
    label: 'YAML',
    value: 'yaml',
    description: "YAML Ain't Markup Language format",
  },
  {
    label: 'CSV',
    value: 'csv',
    description: 'Comma-Separated Values format',
  },
  {
    label: 'BibTeX',
    value: 'bibtex',
    description: 'Bibliography format used with LaTeX',
  },
  {
    label: 'Reference',
    value: 'reference',
    description: 'Structured reference information',
  },
  {
    label: 'Mermaid Diagram',
    value: 'diagram_mermaid',
    description: 'Diagrams and flowcharts using Mermaid syntax',
  },
];
</script>
