<template>
  <full-profile-frame :editable="isEditable" />
</template>

<script setup lang="ts">
import FullProfileFrame from 'src/components/Users/ViewEdit/FullProfileFrame.vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const isEditable = computed(() => route.name === 'edit-profile');
</script>
