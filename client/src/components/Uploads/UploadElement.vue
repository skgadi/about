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
        <q-circular-progress size="md" indeterminate :thickness="0.2" color="primary" show-value>
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

const gskPkgFileStore = useGskPkgFileStore();
const file = ref<File | null>(null);

const isUploading = ref(false);

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
      gskPkgFileStore.uploadInit(file.value, '');
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
const CHUNK_SIZE = 32 * 1024 * 1024; // 32 MB

async function calculateSha512(f: File | null): Promise<void> {
  if (!f) return;
  hash.value = 'Calculating...';
  progress.value = 0;

  hash.value = await hashLargeFile(f);
}

async function hashLargeFile(file: File): Promise<string> {
  const sha = await createSHA512();
  sha.init();

  const totalSize = file.size;
  let offset = 0;

  while (offset < totalSize) {
    const chunk = file.slice(offset, offset + CHUNK_SIZE);
    const buf = await readChunk(chunk);
    sha.update(new Uint8Array(buf));

    offset += CHUNK_SIZE;
    progress.value = Math.min(100, (offset / totalSize) * 100);
  }

  return sha.digest();
}

function readChunk(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error(reader.error?.message || 'Failed to read file chunk'));

    reader.readAsArrayBuffer(blob);
  });
}
</script>
