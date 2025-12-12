<template>
  <q-btn
    round
    flat
    dense
    color="positive"
    icon="mdi-check-circle-outline"
    @click="emit('clicked-ok')"
    :disable="!allowEmpty && (!localHtmlText || localHtmlText?.trim() === '')"
  />
  <q-btn
    round
    flat
    dense
    color="negative"
    icon="mdi-close-circle-outline"
    @click="emit('clicked-cancel')"
  />
</template>
<script setup lang="ts">
defineProps({
  htmlText: {
    type: String as () => string | null,
    required: false,
    default: '',
  },
  editable: {
    type: Boolean,
    required: false,
    default: false,
  },
  allowEmpty: {
    type: Boolean,
    required: false,
    default: false,
  },
  localHtmlText: {
    type: String as () => string | null,
    required: false,
    default: '',
  },
});

const emit = defineEmits<{
  (e: 'clicked-ok'): void;
  (e: 'clicked-cancel'): void;
}>();
</script>
