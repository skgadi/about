<template>
  <div
    style="
      width: 100%;
      height: 800px;
      max-height: calc(100vh - 100px);
      margin: 0;
      padding: 0;
      overflow: hidden;
    "
    class="highlight-item"
  >
    <embed :src="url" style="width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden" />
  </div>
</template>
<script setup lang="ts">
defineProps(['url']);
</script>
