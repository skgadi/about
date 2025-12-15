<template>
  <div :class="parentClass">
    <template v-for="(item, idx) in strings" :key="idx">
      <q-chip
        class="q-mr-sm q-mb-sm"
        :class="thisClass"
        :outline="editable"
        dense
        :removable="editable"
        @remove="removeAString(item)"
        icon-remove="mdi-trash-can-outline"
      >
        <text-field
          :editable="editable"
          :html-text="item"
          :idx="strings.indexOf(item)"
          @updated-text="(newText: string) => updateAString(item, newText)"
        />
      </q-chip>
    </template>
    <q-btn
      v-if="editable"
      size="xs"
      class="q-ma-sm"
      dense
      flat
      round
      color="primary"
      text-color="primary"
      icon="mdi-plus"
      @click="addAString"
    />
  </div>
  <template v-if="!editable && strings.length === 0">&nbsp;</template>
</template>
<script setup lang="ts">
const props = defineProps({
  strings: {
    type: Array as () => string[],
    required: true,
    default: () => [],
  },
  editable: {
    type: Boolean,
    required: false,
    default: false,
  },
  thisClass: {
    type: String,
    required: false,
    default: 'bg-purple-1 text-purple-9',
  },
  parentClass: {
    type: String,
    required: false,
    default: '',
  },
  newStringName: {
    type: String,
    required: false,
    default: 'New Item',
  },
});

const emit = defineEmits<{
  (e: 'updated-strings', newStrings: string[]): void;
  (e: 'updated-strings-as-text', newStringsText: string): void;
}>();

import TextField from 'src/components/Users/ViewEdit/Elements/TextField.vue';

const addAString = () => {
  if (props.strings.includes(props.newStringName)) {
    return;
  }
  const newStrings = [...props.strings, props.newStringName];
  emitJSONAndText(newStrings);
};

const removeAString = (stringToRemove: string) => {
  const newStrings = props.strings.filter((s) => s !== stringToRemove);
  emitJSONAndText(newStrings);
};

const updateAString = (oldString: string, newString: string) => {
  if (props.strings.includes(newString) && oldString !== newString) {
    return;
  }
  const newStrings = props.strings.map((s) => (s === oldString ? newString : s));
  emitJSONAndText(newStrings);
};

const emitJSONAndText = (newStrings: string[]) => {
  emit('updated-strings', newStrings);
  emit('updated-strings-as-text', JSON.stringify(newStrings));
};
</script>
