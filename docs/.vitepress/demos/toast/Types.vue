<script setup lang="ts">
import {
  Button,
  createToastStore,
  useToast,
  ToastViewport,
  ToastRoot,
  ToastTitle,
  ToastDescription,
  ToastClose
} from '@vunset/vue';
import '../button/button.css';
import './toast.css';

// a store of its own, so this page's demos don't share one stack
const store = createToastStore();
const { setToast, updateToast } = useToast(store);

async function upload() {
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
  <div class="demo-button-row">
    <Button class="demo-button" @click="setToast({ title: 'A new version is out', type: 'info' })">Info</Button>
    <Button class="demo-button" @click="setToast({ title: 'Storage almost full', text: '92% of your quota.', type: 'warning' })">
      Warning
    </Button>
    <Button class="demo-button" @click="upload">Upload</Button>
  </div>

  <ToastViewport :store="store" class="demo-toast-viewport">
    <ToastRoot class="demo-toast">
      <div>
        <ToastTitle class="demo-toast-title" />
        <ToastDescription class="demo-toast-description" />
      </div>
      <ToastClose class="demo-toast-close">×</ToastClose>
    </ToastRoot>
  </ToastViewport>
</template>
