<script setup lang="ts">
import { createToastStore, useToast } from '@vunset/vue';
import { AppToaster, AppButton } from '@vunset/ui';

const store = createToastStore();
const { setToast, updateToast } = useToast(store);

async function upload() {
  // `loading` never times out: it waits to be updated by its id.
  const id = setToast({ title: 'Uploading…', text: 'Sending 24 files.', type: 'loading' });
  try {
    await new Promise((resolve, reject) =>
      setTimeout(() => (Math.random() > 0.3 ? resolve(null) : reject(new Error('The server hung up.'))), 1600)
    );
    updateToast(id, { title: 'Upload complete', text: '24 files sent.', type: 'success' });
  } catch (error) {
    updateToast(id, { title: 'Upload failed', text: (error as Error).message, type: 'error' });
  }
}
</script>

<template>
  <AppButton variant="outline" @click="upload">Upload</AppButton>

  <AppToaster :store="store" />
</template>
