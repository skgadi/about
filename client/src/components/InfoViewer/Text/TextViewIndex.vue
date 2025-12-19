<template>{{ infoViewer.data }}</template>
<script setup lang="ts">
defineProps({
  infoViewer: {
    type: Object as PropType<GSK_INFO_VIEWER>,
    required: true,
  },
});

import type { GSK_INFO_VIEWER } from 'src/services/library/types/structures/users';
import { type PropType } from 'vue';
</script>
