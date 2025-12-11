<template>
  <q-item>
    <q-item-section>
      <q-item-label
        v-if="(contribution.userRole && contribution.userRole.trim() !== '') || editable"
      >
        Role:
        <text-field
          :html-text="contribution.userRole"
          :editable="editable"
          allow-empty
          @updated-text="
            (newText: string) => {
              const updatedContribution = { ...contribution, userRole: newText };
              emit('updated-contribution', updatedContribution);
            }
          "
        />
      </q-item-label>
      <q-item-label
        caption
        v-if="contribution.skillsApplied.filter((s) => s.type === 'tech').length > 0 || editable"
      >
        <div>
          Tech skills:
          <list-of-strings
            :strings="
              contribution.skillsApplied
                .filter((skill) => skill.type === 'tech')
                .map((skill) => skill.name)
            "
            :editable="editable"
            this-class="bg-blue-1 text-blue-9"
            new-string-name="New tech skill"
            @updated-strings="
              (updatedStrings: string[]) => {
                const updatedSkills = [
                  ...contribution.skillsApplied.filter((skill) => skill.type !== 'tech'),
                  ...updatedStrings.map((skillName) => ({ name: skillName, type: 'tech' })),
                ];
                const updatedContribution = {
                  ...contribution,
                  skillsApplied: updatedSkills,
                } as GSK_USER_CONTRIBUTION;
                emit('updated-contribution', updatedContribution);
              }
            "
          />
        </div>
      </q-item-label>
      <q-item-label
        caption
        v-if="contribution.skillsApplied.filter((s) => s.type === 'soft').length > 0 || editable"
      >
        <div>
          Soft skills:
          <list-of-strings
            :strings="
              contribution.skillsApplied
                .filter((skill) => skill.type === 'soft')
                .map((skill) => skill.name)
            "
            :editable="editable"
            this-class="bg-blue-1 text-blue-9"
            new-string-name="New soft skill"
            @updated-strings="
              (updatedStrings: string[]) => {
                const updatedSkills = [
                  ...contribution.skillsApplied.filter((skill) => skill.type !== 'soft'),
                  ...updatedStrings.map((skillName) => ({ name: skillName, type: 'soft' })),
                ];
                const updatedContribution = {
                  ...contribution,
                  skillsApplied: updatedSkills,
                } as GSK_USER_CONTRIBUTION;
                emit('updated-contribution', updatedContribution);
              }
            "
          />
        </div>
      </q-item-label>
      <q-item-label
        caption
        v-if="(contribution.notes && contribution.notes.trim() !== '') || editable"
      >
        Notes:
        <i>
          <text-field
            :html-text="contribution.notes || ''"
            :editable="editable"
            allow-empty
            @updated-text="
              (newText: string) => {
                const updatedContribution = { ...contribution, notes: newText };
                emit('updated-contribution', updatedContribution);
              }
            "
        /></i>
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
        @click="() => emit('deleted-contribution')"
      />
    </q-item-section>
  </q-item>
</template>
<script lang="ts" setup>
defineProps({
  contribution: {
    type: Object as () => GSK_USER_CONTRIBUTION,
    required: true,
  },
  editable: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const emit = defineEmits<{
  (e: 'updated-contribution', updatedContribution: GSK_USER_CONTRIBUTION): void;
  (e: 'deleted-contribution'): void;
}>();

import TextField from 'src/components/Users/ViewEdit/Elements/TextField.vue';
import ListOfStrings from 'src/components/Users/ViewEdit/Meta/ListOfStrings.vue';

import type { GSK_USER_CONTRIBUTION } from 'src/services/library/types/structures/users';
</script>
