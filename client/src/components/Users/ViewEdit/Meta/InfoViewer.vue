<template>
  <q-btn
    v-if="editable"
    flat
    rounded
    class="q-px-md"
    dense
    icon="mdi-creation-outline"
    label="Generate all"
    no-caps
    color="primary"
    @click="() => genAnElement('all', 0)"
  />
  <br />
  <div class="text-h6">
    <q-btn
      v-if="editable"
      size="sm"
      flat
      round
      dense
      icon="mdi-creation-outline"
      color="primary"
      class="q-mr-md"
      @click="() => genAnElement('summary', 0)"
    />
    <text-field
      :html-text="metaInfo?.title || ''"
      :editable="editable"
      field-to-update="title"
      @updated-text="(newText: string) => updateMetaField('title', newText)"
    />
  </div>
  <div class="text-subtitle1 text-justify">
    <text-field
      :html-text="metaInfo?.subtitle || ''"
      :editable="editable"
      field-to-update="subtitle"
      @updated-text="(newText: string) => updateMetaField('subtitle', newText)"
    />
  </div>
  <div class="text-caption" v-if="metaInfo?.publishedDate || editable">
    Date:
    <text-field
      :html-text="metaInfo?.publishedDate || ''"
      :editable="editable"
      field-to-update="publishedDate"
      @updated-text="(newText: string) => updateMetaField('publishedDate', newText)"
      :is-date="true"
    />
  </div>
  <template v-if="!showLittle">
    Authors:
    <list-of-strings
      :strings="metaInfo?.authors || []"
      :editable="editable"
      this-class="bg-blue-1 text-blue-9"
      new-string-name="New Author"
      @updated-strings="(updatedStrings: string[]) => updateMetaField('authors', updatedStrings)"
    />
    <div class="text-body2 text-weight-light text-justify">
      <text-field
        :html-text="metaInfo?.shortDescription || ''"
        :editable="editable"
        field-to-update="shortDescription"
        @updated-text="(newText: string) => updateMetaField('shortDescription', newText)"
      />
    </div>
    <div class="text-caption text-weight-light text-justify">
      <i>
        <text-field
          :html-text="metaInfo?.description || ''"
          :editable="editable"
          field-to-update="description"
          @updated-text="(newText: string) => updateMetaField('description', newText)"
        />
      </i>
    </div>
    KeyWords:
    <list-of-strings
      :strings="metaInfo?.keywords || []"
      :editable="editable"
      this-class="bg-green-1 text-green-9"
      new-string-name="New Keyword"
      @updated-strings="(updatedStrings: string[]) => updateMetaField('keywords', updatedStrings)"
    />
    <boolean-viewer
      :bool-value="metaInfo?.isPublic || false"
      :editable="editable"
      text-when-true="Public"
      text-when-false="Private"
      @updated-bool="(newValue: boolean) => updateMetaField('isPublic', newValue)"
    />
    <br />
    <contribution-viewer
      :contributions="metaInfo?.userContribution || []"
      :editable="editable"
      @updated-contributions="
        (newContributions: GSK_USER_CONTRIBUTION[]) =>
          updateMetaField('userContribution', newContributions)
      "
      @generate-skills="(idx: number) => genAnElement('skills', idx)"
      @generate-contributions="() => genAnElement('roles', 0)"
    />
    <br />
    <validation-viewer
      :validations="metaInfo?.validationAuthority || []"
      :editable="editable"
      @updated-validations="
        (newValidations: GSK_VALIDATION_AUTHORITY[]) =>
          updateMetaField('validationAuthority', newValidations)
      "
      @generate-validations="() => genAnElement('validation', 0)"
    />
  </template>
</template>
<script lang="ts" setup>
const props = defineProps({
  metaInfo: {
    type: Object as PropType<GSK_META_INFO>,
    required: true,
  },
  editable: {
    type: Boolean,
    required: false,
    default: false,
  },
  element: {
    type: String as PropType<'timelines' | 'events' | 'documents' | 'activities'>,
    required: true,
  },
  elementId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  showLittle: {
    type: Boolean,
    required: false,
    default: false,
  },
});

import TextField from 'src/components/Users/ViewEdit/Elements/TextField.vue';
import ListOfStrings from 'src/components/Users/ViewEdit/Meta/ListOfStrings.vue';
import BooleanViewer from 'src/components/Users/ViewEdit/Meta/BooleanViewer.vue';
import ContributionViewer from 'src/components/Users/ViewEdit/Meta/ContributionViewer.vue';
import ValidationViewer from 'src/components/Users/ViewEdit/Meta/ValidationViewer.vue';

import type {
  GSK_META_INFO,
  GSK_USER_CONTRIBUTION,
  GSK_VALIDATION_AUTHORITY,
} from 'src/services/library/types/structures/users';
import type { PropType } from 'vue';
import { useSocketStore } from 'src/stores/socket-store';
import type { GSK_CS_META_INFO_UPDATE_A_FIELD } from 'src/services/library/types/data-transfer/meta-info';
import type { GSK_CS_AI_REQUEST_GEN_DETAILS_FOR_DOC } from 'src/services/library/types/data-transfer/ai';

const socketStore = useSocketStore();

const updateMetaField = (
  fieldName: string,
  newValue: string | boolean | string[] | GSK_USER_CONTRIBUTION[] | GSK_VALIDATION_AUTHORITY[],
) => {
  const message: GSK_CS_META_INFO_UPDATE_A_FIELD = {
    id: 'GSK_CS_META_INFO_UPDATE_A_FIELD',
    payload: {
      elementType: props.element,
      elementId: props.elementId,
      userId: props.userId,
      fieldName,
      newValue,
    },
  };
  //console.log('Emitting meta info update:', message);
  socketStore.emit('GSK_CS_META_INFO_UPDATE_A_FIELD', message);
};

const genAnElement = (
  level: GSK_CS_AI_REQUEST_GEN_DETAILS_FOR_DOC['payload']['level'],
  index: number,
) => {
  switch (props.element) {
    case 'documents':
      {
        const payload: GSK_CS_AI_REQUEST_GEN_DETAILS_FOR_DOC = {
          id: 'GSK_CS_AI_REQUEST_GEN_DETAILS_FOR_DOC',
          payload: {
            userId: props.userId,
            documentId: props.elementId,
            indexes: [index],
            level,
          },
        };
        socketStore.emit('GSK_CS_AI_REQUEST_GEN_DETAILS_FOR_DOC', payload);
      }
      break;
    case 'activities':
    case 'events':
    case 'timelines':
      console.log('Skill generation not supported for this element type yet.');
      break;
  }
};
</script>
