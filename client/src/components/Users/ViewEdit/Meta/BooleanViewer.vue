<template>
  <div
    v-if="!showOnlyWhenEditable || editable"
    :class="classToApply"
    @click="toggleValue"
    style="cursor: pointer"
  >
    <q-icon
      :name="boolValue ? 'mdi-checkbox-outline' : 'mdi-checkbox-blank-outline'"
      :color="boolValue ? 'positive' : 'negative'"
      :size="iconSize"
      style="margin-right: 5px"
    />

    {{ boolValue ? textWhenTrue : textWhenFalse }}
  </div>
</template>
<script setup lang="ts">
const props = defineProps({
  boolValue: {
    type: Boolean,
    required: true,
  },
  editable: {
    type: Boolean,
    required: false,
    default: false,
  },
  textWhenTrue: {
    type: String,
    required: false,
    default: 'True',
  },
  textWhenFalse: {
    type: String,
    required: false,
    default: 'False',
  },
  showOnlyWhenEditable: {
    type: Boolean,
    required: false,
    default: true,
  },
  classToApply: {
    type: String,
    required: false,
    default: '',
  },
  iconSize: {
    type: String,
    required: false,
    default: '24px',
  },
});

const emit = defineEmits<{
  (e: 'updated-bool', newValue: boolean): void;
}>();

const toggleValue = () => {
  if (props.editable) {
    emit('updated-bool', !props.boolValue);
  }
};
</script>
