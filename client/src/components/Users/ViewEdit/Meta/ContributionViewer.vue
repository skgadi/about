<template>
  <div class="row items-center mb-2" v-if="contributions.length > 0 || editable">
    <div class="col-auto">
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
            const newContributions = [...contributions];
            newContributions.push({
              contributionDate: new Date().toISOString(),
              userRole: '',
              notes: '',
              skillsApplied: [],
            });
            emit('updated-contributions', newContributions);
          }
        "
      />
    </div>
    <div class="col-auto">
      <q-btn
        v-if="editable"
        size="sm"
        flat
        round
        dense
        icon="mdi-creation-outline"
        color="primary"
        @click="
          () => {
            emit('generate-contributions');
          }
        "
      />
    </div>
    <div class="col q-pl-md">
      <span>Contribution</span><span v-if="contributions.length !== 1">s</span>
    </div>
  </div>
  <q-list dense bordered separator style="border-radius: 16px" v-if="contributions.length > 0">
    <contribution-element
      v-for="(contribution, index) in contributions"
      :key="index"
      :contribution="contribution"
      :editable="editable"
      @updated-contribution="
        (updatedContribution: GSK_USER_CONTRIBUTION) => {
          const newContributions = [...contributions];
          newContributions[index] = updatedContribution;
          emit('updated-contributions', newContributions);
        }
      "
      @deleted-contribution="
        () => {
          const newContributions = contributions.filter((_, i) => i !== index);
          emit('updated-contributions', newContributions);
        }
      "
      @generate-skills="() => emit('generate-skills', index)"
    />
  </q-list>
</template>
<script lang="ts" setup>
defineProps({
  contributions: {
    type: Array as () => GSK_USER_CONTRIBUTION[],
    required: true,
  },
  editable: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const emit = defineEmits<{
  (e: 'updated-contributions', newContributions: GSK_USER_CONTRIBUTION[]): void;
  (e: 'generate-skills', idx: number): void;
  (e: 'generate-contributions'): void;
}>();

import ContributionElement from 'src/components/Users/ViewEdit/Meta/ContributionElement.vue';

import type { GSK_USER_CONTRIBUTION } from 'src/services/library/types/structures/users';
</script>
