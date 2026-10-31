<script setup lang="ts">
import {
  Button,
  createToastStore,
  useToast,
  ToastViewport,
  ToastRoot,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastProgress
} from '@vunset/vue';
import '../button/button.css';
import './toast.css';

const store = createToastStore();
const { setToast } = useToast(store);
</script>

<template>
  <div class="demo-button-row">
    <Button class="demo-button" @click="setToast({ title: 'Message archived', text: 'Hover to hold it.' })">
      Archive
    </Button>
    <Button class="demo-button" @click="setToast({ title: 'Link copied', timeout: 2000 })">Copy, 2 seconds</Button>
  </div>

  <ToastViewport :store="store" class="demo-toast-viewport">
    <ToastRoot class="demo-toast">
      <div>
        <ToastTitle class="demo-toast-title" />
        <ToastDescription class="demo-toast-description" />
      </div>
      <ToastClose class="demo-toast-close">×</ToastClose>
      <ToastProgress class="demo-toast-progress" />
    </ToastRoot>
  </ToastViewport>
</template>
