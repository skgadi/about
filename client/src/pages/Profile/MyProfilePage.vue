<template>
  <AuthRequiredElement>
    <q-page class="row items-center justify-evenly">
      <div class="q-pa-md" style="width: 400px">
        <upload-element />
      </div>
      <q-uploader multiple batch append ref="uploadRef" hide-upload-btn> </q-uploader>
      <q-btn label="Show files" @click="showFiles" />

      <input type="file" id="file-input" multiple />
      <div id="preview"></div>
    </q-page>
  </AuthRequiredElement>
</template>

<script setup lang="ts">
import AuthRequiredElement from 'src/components/Auth/AuthRequiredElement.vue';
import UploadElement from 'src/components/Uploads/UploadElement.vue';

import { QUploader } from 'quasar';
import { ref } from 'vue';
const uploadRef = ref<QUploader>();

const showFiles = () => {
  uploadRef.value?.files.forEach((file: File) => {
    console.log(file.name);
  });
};
</script>
