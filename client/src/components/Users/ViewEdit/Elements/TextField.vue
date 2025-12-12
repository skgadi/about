<template>
  <span
    :class="thisClass"
    :style="thisStyle"
    v-html="htmlToShow"
    v-if="editable || htmlText"
    :title="valueTooltip"
  />
  <span>
    <template v-if="editable">
      <q-icon name="mdi-pencil-outline" size="16px" class="q-ml-xs" style="cursor: pointer" />
      <template v-if="hoverText">
        <q-tooltip>
          {{ hoverText }}
        </q-tooltip>
      </template>
      <q-popup-edit
        v-model="localHtmlText"
        type="textarea"
        v-slot="scope"
        class="q-py-md"
        style="border-radius: 50px; width: 400px"
      >
        <template v-if="selectOptions.length === 0">
          <q-input
            v-model="localHtmlText"
            :type="isDate ? 'datetime-local' : 'text'"
            outlined
            rounded
            dense
            style="min-width: 250px"
            clearable
            clear-icon="mdi-close"
            autofocus
            @keyup.enter="
              () => {
                scope.set();
                emitValue();
              }
            "
          >
            <template v-slot:after>
              <text-field-buttons
                :local-html-text="localHtmlText"
                :html-text="htmlText"
                :editable="editable"
                :allow-empty="allowEmpty"
                @clicked-ok="
                  () => {
                    scope.set();
                    emitValue();
                  }
                "
                @clicked-cancel="scope.cancel()"
              />
            </template>
          </q-input>
        </template>
        <template v-else>
          <q-select
            v-model="localHtmlText"
            :options="selectOptions"
            outlined
            rounded
            dense
            style="min-width: 250px"
            clearable
            clear-icon="mdi-close"
            autofocus
            emit-value
            map-options
          >
            <template v-slot:after>
              <text-field-buttons
                :local-html-text="localHtmlText"
                :html-text="htmlText"
                :editable="editable"
                :allow-empty="allowEmpty"
                @clicked-ok="
                  () => {
                    scope.set();
                    emitValue();
                  }
                "
                @clicked-cancel="scope.cancel()"
              />
            </template>
          </q-select>
        </template>
      </q-popup-edit>
    </template>
  </span>
</template>
<script setup lang="ts">
const props = defineProps({
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
  userId: {
    type: String,
    required: false,
    default: '',
  },
  fieldToUpdate: {
    type: String,
    required: false,
    default: '',
  },
  allowEmpty: {
    type: Boolean,
    required: false,
    default: false,
  },
  hoverText: {
    type: String,
    required: false,
    default: 'Click to edit',
  },
  thisStyle: {
    type: String,
    required: false,
    default: '',
  },
  thisClass: {
    type: String,
    required: false,
    default: '',
  },
  idx: {
    type: Number,
    required: false,
    default: 0,
  },
  isDate: {
    type: Boolean,
    required: false,
    default: false,
  },
  selectOptions: {
    type: Array as () => Array<GSK_QUASAR_OPTION>,
    required: false,
    default: () => [],
  },
});

const emit = defineEmits<{
  (e: 'updated-text', newText: string, idx: number): void;
}>();

import TextFieldButtons from 'src/components/Users/ViewEdit/Elements/TextFieldButtons.vue';

import { displayDateTime } from 'src/services/utils/date-time';
import { computed, onMounted } from 'vue';
import { ref, watch } from 'vue';
import moment from 'moment';
import type { GSK_QUASAR_OPTION } from 'src/services/library/types/structures/client';

const localHtmlText = ref<string | null>(null);

const getLocalHtmlText = (): string => {
  if (props.isDate && props.htmlText) {
    // props.htmlText is in ISO format
    const localDate = moment(props.htmlText).local();
    // return in format yyyy-MM-DDTHH:MM:ss.SSS into local
    return localDate.format('YYYY-MM-DDTHH:mm:ss.SSS');
  }
  return props.htmlText || '';
};

onMounted(() => {
  localHtmlText.value = getLocalHtmlText();
});

watch(
  () => props.htmlText,
  () => {
    localHtmlText.value = getLocalHtmlText();
  },
);

const emitValue = () => {
  if (props.allowEmpty === false && (!localHtmlText.value || localHtmlText.value.trim() === '')) {
    return;
  }
  // Check if it has changed
  if (localHtmlText.value?.trim() === props.htmlText?.trim()) {
    return;
  }
  if (props.isDate) {
    emit('updated-text', dateText.value, props.idx);
  }
  emit('updated-text', localHtmlText.value || '', props.idx);
};

const dateText = computed(() => {
  if (props.isDate && localHtmlText.value) {
    // Convert local date to ISO format
    const localDate = moment(localHtmlText.value);
    return localDate.toISOString();
  }
  return '';
});

const htmlToShow = computed(() => {
  if (props.isDate && props.htmlText) {
    return displayDateTime(props.htmlText);
  }
  if (props.selectOptions.length > 0) {
    const found = props.selectOptions.find((option) => option.value === props.htmlText);
    return found ? found.label : props.htmlText;
  }
  return props.htmlText;
});

const valueTooltip = computed(() => {
  if (props.isDate && props.htmlText) {
    return displayDateTime(props.htmlText);
  }
  if (props.selectOptions.length > 0) {
    const found = props.selectOptions.find((option) => option.value === props.htmlText);
    return found ? found.description : props.htmlText || '';
  }
  return props.htmlText || '';
});
</script>
