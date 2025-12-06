<template>
  <q-file
    dense
    v-model="file"
    rounded
    outlined
    clear-icon="mdi-close"
    :clearable="!isUploading"
    :disable="isUploading"
    :rules="[() => (file ? true : 'Please select a file to upload.')]"
    :hint="calculatingChecksum ? 'Calculating checksum. Pleae wait...' : ''"
  >
    <template v-slot:file="{ file }">
      <template v-if="file">
        <div class="col">
          <div class="text-bold">
            {{
              file.name.length > 30
                ? file.name.slice(0, 15) + '...' + file.name.slice(-10)
                : file.name
            }}
          </div>
        </div>
      </template>
    </template>
    <q-tooltip
      v-if="file"
      style="white-space: normal; overflow-wrap: break-word; border-radius: 16px"
      max-width="200px"
      class="bg-black fg-white"
    >
      <div>
        <u>File Name:</u><br />{{ file.name }}<br /><br />
        <u>File Size:</u><br />{{ formatFileSizeISO(file.size, 3) }}<br /><br />
        <u>File Type:</u><br />{{ file.type }}<br /><br />
        <u>SHA-512:</u><br />{{ checksumSHA512 ? checksumSHA512 : 'Calculating...' }}
      </div>
    </q-tooltip>
    <template #prepend>
      <q-icon name="mdi-file-document-outline" v-if="!calculatingChecksum" />
      <q-circular-progress
        v-else
        size="sm"
        dense
        :indeterminate="checksumProgress <= 0"
        :value="checksumProgress"
        :thickness="0.2"
        color="primary"
        track-color="grey-3"
      />
    </template>
    <template #after>
      <q-btn
        :disable="!isUploadEnabled"
        :color="isUploadEnabled ? 'primary' : 'negative'"
        v-if="!isUploading"
        flat
        round
        dense
        :icon="isUploadEnabled ? 'mdi-cloud-upload-outline' : 'mdi-alert-outline'"
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
import { useSocketStore } from 'src/stores/socket-store';
import type { GSK_CS_DOCUMENT_UPLOAD_REQUEST } from 'src/services/library/types/data-transfer/documents';
import { getFileMeta } from 'src/services/gsk-packages/file-handling/client/utils/file';
import { formatFileSizeISO } from 'src/services/utils/file';

const gskPkgFileStore = useGskPkgFileStore();
const authStore = useAuthStore();
const socketStore = useSocketStore();
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
const checksumProgress = ref<number>(0);
const calculatingChecksum = ref<boolean>(false);
const currentHashJob = ref(0);

watch(
  () => file.value,
  async (newFile) => {
    // CANCEL previous hash
    currentHashJob.value++;

    checksumProgress.value = 0;

    if (!newFile) {
      checksumSHA512.value = '';
      return;
    }

    const thisJobId = currentHashJob.value;
    calculatingChecksum.value = true;

    const result = await calculateSha512(newFile, thisJobId);

    // Only apply result if STILL the latest job
    if (result.jobId === currentHashJob.value) {
      checksumSHA512.value = result.hash;
    }

    calculatingChecksum.value = false;
  },
);

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
      const element: GSK_CS_DOCUMENT_UPLOAD_REQUEST = {
        id: 'GSK_CS_DOCUMENT_UPLOAD_REQUEST',
        payload: {
          fileId: uploadEntry.fileId,
          userId: authStore.userDetails?.id || '',
          fileMeta: getFileMeta(file.value!, checksumSHA512.value),
        },
      };
      socketStore.emit('GSK_CS_DOCUMENT_UPLOAD_REQUEST', element);
      resetAll();
    }
  },
  { deep: true },
);

const isUploadEnabled = computed(() => {
  return !!file.value && !isUploading.value && !!checksumSHA512.value && isFileSafeToUpload.value;
});

// checksum calculation using hash-wasm

async function calculateSha512(
  file: File,
  jobId: number,
): Promise<{ hash: string; jobId: number }> {
  try {
    const sha = await createSHA512();
    sha.init();

    const total = file.size;
    let offset = 0;

    while (offset < total) {
      // CANCEL if another job started
      if (jobId !== currentHashJob.value) {
        console.log('Checksum cancelled');
        return { hash: '', jobId };
      }

      const end = Math.min(offset + 1024 * 1024, total); // 1 MB chunks
      const chunk = await file.slice(offset, end).arrayBuffer();
      sha.update(new Uint8Array(chunk));

      offset = end;
      checksumProgress.value = (offset / total) * 100;

      // yield back to browser
      await new Promise(requestAnimationFrame);
    }

    return { hash: sha.digest(), jobId };
  } catch (err) {
    console.error('Hash error:', err);
    return { hash: '', jobId };
  }
}
</script>
