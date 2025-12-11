<template>
  <div class="row items-center mb-2" v-if="validations.length > 0 || editable">
    <div>
      <q-btn
        v-if="editable"
        size="sm"
        flat
        round
        dense
        icon="mdi-plus"
        color="primary"
        @click="
          () => {
            const newValidations = [...validations];
            newValidations.push({
              name: '',
              authorityUrl: '',
              validationDate: new Date().toISOString(),
              notes: '',
            });
            emit('updated-validations', newValidations);
          }
        "
      />
    </div>
    <span>Validation</span><span v-if="validations.length !== 1">s</span>
  </div>
  <q-list dense bordered separator style="border-radius: 16px" v-if="validations.length > 0">
    <validation-element
      v-for="(validation, index) in validations"
      :key="index"
      :validation="validation"
      :editable="editable"
      @updated-validation="
        (updatedValidation: GSK_VALIDATION_AUTHORITY) => {
          const newValidations = [...validations];
          newValidations[index] = updatedValidation;
          emit('updated-validations', newValidations);
        }
      "
      @deleted-validation="
        () => {
          const newValidations = validations.filter((_, i) => i !== index);
          emit('updated-validations', newValidations);
        }
      "
    />
  </q-list>
</template>
<script lang="ts" setup>
defineProps({
  validations: {
    type: Array as () => GSK_VALIDATION_AUTHORITY[],
    required: true,
  },
  editable: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const emit = defineEmits<{
  (e: 'updated-validations', validations: GSK_VALIDATION_AUTHORITY[]): void;
}>();

import ValidationElement from 'src/components/Users/ViewEdit/Meta/ValidationElement.vue';

import type { GSK_VALIDATION_AUTHORITY } from 'src/services/library/types/structures/users';
</script>
