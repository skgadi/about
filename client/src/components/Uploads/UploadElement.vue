<template>
  <q-file
    dense
    v-model="file"
    rounded
    outlined
    clear-icon="mdi-close"
    :clearable="!isUploading"
    :disable="isUploading"
    :rules="[
      () => (file ? true : 'Please select a file to upload.'),
      () => (isFileSafeToUpload ? true : 'This file already exists in your documents.'),
    ]"
  >
    <q-tooltip v-if="file && checksumSHA512" style="word-wrap: break-word" max-width="200px">
      SHA-512: {{ checksumSHA512 }}
    </q-tooltip>
    <template #prepend>
      <q-icon name="mdi-file-document-outline" />
    </template>
    <template #after>
      <q-btn
        :disable="!file || isUploading || !checksumSHA512 || !isFileSafeToUpload"
        v-if="!isUploading"
        flat
        round
        dense
        icon="mdi-cloud-upload-outline"
        @click="uploadFile()"
      />
      <q-btn v-else flat round dense @click="stopUpload">
        <q-circular-progress
          size="md"
          :indeterminate="!gskPkgFileStore.uploadProgress(checksumSHA512)"
          :value="gskPkgFileStore.uploadProgress(checksumSHA512)"
          :thickness="0.2"
          color="primary"
          track-color="grey-3"
          show-value
        >
          <q-icon color="negative" name="mdi-stop" />
        </q-circular-progress>
      </q-btn>
    </template>
  </q-file>
</template>
<script setup lang="ts">
const emit = defineEmits<{
  (e: 'duplicate-file', fileId: string): void;
  (e: 'upload-completed', fileId: string): void;
}>();

import { computed, ref, watch } from 'vue';
import { createSHA512 } from 'hash-wasm';
import { useGskPkgFileStore } from 'src/services/gsk-packages/file-handling/client/store/file-store';
import { useAuthStore } from 'src/stores/auth-store';

const gskPkgFileStore = useGskPkgFileStore();
const authStore = useAuthStore();
const file = ref<File | null>(null);

const isUploading = ref(false);

const uploadFile = () => {
  if (file.value) {
    isUploading.value = true;
    if (!checksumSHA512.value) {
      console.error('No hash calculated, aborting upload. Hash value:' + checksumSHA512.value);
      isUploading.value = false;
      return;
    }
    console.log('Uploading file with hash:', checksumSHA512.value); // For debugging
    try {
      gskPkgFileStore.uploadInit(file.value, checksumSHA512.value);
    } catch (error) {
      console.error('File upload failed:', error);
    } finally {
      //isUploading.value = false;
    }
  }
};

const checksumSHA512 = ref<string>('');
const progress = ref<number>(0);

watch(
  () => file.value,
  (newFile) => {
    progress.value = 0;
    if (newFile) {
      checksumSHA512.value = '';
      setTimeout(() => {
        calculateSha512(newFile).catch((error) => {
          console.error('Error calculating SHA-512 hash:', error);
        });
      }, 100);
    } else {
      checksumSHA512.value = '';
    }
  },
);

async function calculateSha512(file: File | null): Promise<void> {
  if (!file) return;

  checksumSHA512.value = '';
  progress.value = 0;

  checksumSHA512.value = await hashLargeFile(file);
}

async function hashLargeFile(file: File): Promise<string> {
  const sha = await createSHA512();
  sha.init();

  const reader = file.stream().getReader(); // Pure binary stream
  let bytesRead = 0;
  const total = file.size;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    // value is a Uint8Array — safe binary
    sha.update(value);

    bytesRead += value.length;
    progress.value = (bytesRead / total) * 100;
  }

  return sha.digest(); // pure hex string
}

const isFileSafeToUpload = computed(() => {
  if (!checksumSHA512.value) return false;

  if (!authStore.userDetails) return false;

  const duplicateFile = authStore.userDetails.details.documents?.find(
    (doc) => doc.checksumSHA512 === checksumSHA512.value,
  );
  // emit duplicate file found
  if (duplicateFile) {
    emit('duplicate-file', duplicateFile.id);
    return false;
  }
  return true;
});

const stopUpload = () => {
  gskPkgFileStore.stopUpload(checksumSHA512.value);
  resetAll();
};

const resetAll = () => {
  isUploading.value = false;
  file.value = null;
  checksumSHA512.value = '';
  console.log('UploadElement: Reset all states after upload completion/cancellation.');
};

watch(
  () => gskPkgFileStore.uploads,
  (newUploadsData) => {
    // check if the current file upload is completed
    const uploadEntry = newUploadsData.find((el) => el.sha512Hash === checksumSHA512.value);
    if (uploadEntry && uploadEntry.isFinished) {
      // emit event to parent component
      emit('upload-completed', uploadEntry.fileId);
      // Send information to server to copy the file to user's documents
      // TODO: Implement this functionality as needed
      resetAll();
    }
  },
  { deep: true },
);
</script>
