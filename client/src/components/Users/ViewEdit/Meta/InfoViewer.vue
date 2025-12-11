<template>
  <div class="text-h6">
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
  <contribution-viewer
    :contributions="metaInfo?.userContribution || []"
    :editable="editable"
    @updated-contributions="
      (newContributions: GSK_USER_CONTRIBUTION[]) =>
        updateMetaField('userContribution', newContributions)
    "
  />
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
});

import TextField from 'src/components/Users/ViewEdit/Elements/TextField.vue';
import ListOfStrings from 'src/components/Users/ViewEdit/Meta/ListOfStrings.vue';
import BooleanViewer from 'src/components/Users/ViewEdit/Meta/BooleanViewer.vue';
import ContributionViewer from 'src/components/Users/ViewEdit/Meta/ContributionViewer.vue';

import type {
  GSK_META_INFO,
  GSK_USER_CONTRIBUTION,
} from 'src/services/library/types/structures/users';
import type { PropType } from 'vue';
import { useSocketStore } from 'src/stores/socket-store';
import type { GSK_CS_META_INFO_UPDATE_A_FIELD } from 'src/services/library/types/data-transfer/meta-info';

const socketStore = useSocketStore();

const updateMetaField = (
  fieldName: string,
  newValue: string | boolean | string[] | GSK_USER_CONTRIBUTION[],
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
</script>
