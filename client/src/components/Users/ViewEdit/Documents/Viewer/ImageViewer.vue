<template>
  <div
    style="width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden"
  >
    <q-img
      class="highligh-item"
      :src="url"
      style="max-width: 100%; height: 100%"
      fit="contain"
    />
  </div>
</template>
<script lang="ts" setup>
defineProps(['url']);
</script>
