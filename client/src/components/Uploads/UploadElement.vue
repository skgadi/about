<template>
  <q-file
    dense
    v-model="file"
    rounded
    outlined
    clear-icon="mdi-close"
    :clearable="!isUploading"
    :disable="isUploading"
  >
    <template #prepend>
      <q-icon name="mdi-file-document-outline" />
    </template>
    <template #after>
      <q-btn
        :disable="!file"
        v-if="!isUploading"
        flat
        round
        dense
        icon="mdi-cloud-upload-outline"
        @click="uploadFile()"
      />
      <q-btn v-else flat round dense @click="isUploading = false">
        <q-circular-progress
          size="md"
          :indeterminate="!gskPkgFileStore.uploadProgress(fileUuid)"
          :value="gskPkgFileStore.uploadProgress(fileUuid)"
          :thickness="0.2"
          color="primary"
          show-value
        >
          <q-icon color="negative" name="mdi-stop" />
        </q-circular-progress>
      </q-btn>
    </template>
  </q-file>

  {{ hash }}
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { createSHA512 } from 'hash-wasm';
import { useGskPkgFileStore } from 'src/services/gsk-packages/file-handling/client/store/file-store';
import { uid } from 'quasar';

const gskPkgFileStore = useGskPkgFileStore();
const file = ref<File | null>(null);

const isUploading = ref(false);
const fileUuid = ref<string>('');

const uploadFile = async () => {
  if (file.value) {
    await calculateSha512(file.value);
    isUploading.value = true;
    if (!hash.value) {
      console.error('No hash calculated, aborting upload. Hash value:' + hash.value);
      isUploading.value = false;
      return;
    }
    console.log('Uploading file with hash:', hash.value); // For debugging
    try {
      fileUuid.value = uid();
      gskPkgFileStore.uploadInit(file.value, hash.value, fileUuid.value);
      file.value = null;
    } catch (error) {
      console.error('File upload failed:', error);
    } finally {
      //isUploading.value = false;
    }
  }
};

const hash = ref<string>('');
const progress = ref<number>(0);

async function calculateSha512(file: File | null): Promise<void> {
  if (!file) return;

  hash.value = 'Calculating...';
  progress.value = 0;

  hash.value = await hashLargeFile(file);
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
</script>
