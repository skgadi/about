<template>
  <template v-if="extension === 'pdf'">
    <PdfViewer :url="url" />
  </template>
  <template
    v-else-if="
      ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'tiff'].includes(extension.toLowerCase())
    "
  >
    <ImageViewer :url="url" />
  </template>
  <template v-else>
    <div
      style="
        width: 100%;
        height: 250px;
        max-height: calc(100vh - 200px);
        margin: 0;
        padding: 0;
        overflow: hidden;
      "
      class="highlight-item"
    >
      <div
        style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        "
      >
        <div style="text-align: center">
          <p><q-icon name="mdi-file-hidden" size="100px" /></p>
          <p>Preview not available for this file type.</p>
        </div>
      </div>
    </div>
  </template>
</template>
<script lang="ts" setup>
defineProps({
  url: {
    type: String,
    required: true,
  },
  extension: {
    type: String,
    required: true,
  },
});

import PdfViewer from 'src/components/Users/ViewEdit/Documents/Viewer/PdfViewer.vue';
import ImageViewer from 'src/components/Users/ViewEdit/Documents/Viewer/ImageViewer.vue';
</script>
