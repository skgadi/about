<template>
  <q-item>
    <q-item-section>
      <q-item-label v-if="(validation.name && validation.name.trim() !== '') || editable">
        Name:
        <text-field
          :html-text="validation.name"
          :editable="editable"
          allow-empty
          @updated-text="
            (newText: string) => {
              const updatedValidation = { ...validation, name: newText };
              emit('updated-validation', updatedValidation);
            }
          "
        />
      </q-item-label>
      <q-item-label
        caption
        v-if="(validation.authorityUrl && validation.authorityUrl.trim() !== '') || editable"
      >
        Authority URL:
        <q-btn
          flat
          dense
          class="px-0"
          no-caps
          :href="editable ? undefined : validation.authorityUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          <text-field
            :html-text="validation.authorityUrl || ''"
            :editable="editable"
            allow-empty
            @updated-text="
              (newText: string) => {
                const updatedValidation = { ...validation, authorityUrl: newText };
                emit('updated-validation', updatedValidation);
              }
            "
          />
        </q-btn>
      </q-item-label>
      <q-item-label
        caption
        v-if="(validation.validationDate && validation.validationDate.trim() !== '') || editable"
      >
        Date:
        <text-field
          :html-text="validation.validationDate || ''"
          :editable="editable"
          :is-date="true"
          allow-empty
          @updated-text="
            (newText: string) => {
              const updatedValidation = { ...validation, validationDate: newText };
              emit('updated-validation', updatedValidation);
            }
          "
        />
      </q-item-label>
      <q-item-label caption v-if="(validation.notes && validation.notes.trim() !== '') || editable">
        Notes:
        <text-field
          :html-text="validation.notes || ''"
          :editable="editable"
          allow-empty
          @updated-text="
            (newText: string) => {
              const updatedValidation = { ...validation, notes: newText };
              emit('updated-validation', updatedValidation);
            }
          "
        />
      </q-item-label>
    </q-item-section>
    <q-item-section side top>
      <q-btn
        v-if="editable"
        size="sm"
        flat
        round
        dense
        icon="mdi-trash-can-outline"
        color="negative"
        @click="() => emit('deleted-validation')"
      />
    </q-item-section>
  </q-item>
</template>
<script lang="ts" setup>
defineProps({
  validation: {
    type: Object as () => GSK_VALIDATION_AUTHORITY,
    required: true,
  },
  editable: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const emit = defineEmits<{
  (e: 'updated-validation', updatedValidation: GSK_VALIDATION_AUTHORITY): void;
  (e: 'deleted-validation'): void;
}>();

import TextField from 'src/components/Users/ViewEdit/Elements/TextField.vue';
//import DateField from 'src/components/Users/ViewEdit/Elements/DateField.vue';

import type { GSK_VALIDATION_AUTHORITY } from 'src/services/library/types/structures/users.js';
</script>
