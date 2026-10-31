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

const store = createToastStore();
const { toasts, setToast } = useToast(store);

function retry() {
  setToast({ id: 'offline', title: 'No connection', text: 'Still retrying…', type: 'error' });
}
</script>

<template>
  <Button class="demo-button" @click="retry">Retry</Button>

  <ToastViewport :store="store" class="demo-toast-viewport">
    <ToastRoot class="demo-toast">
      <div>
        <ToastTitle class="demo-toast-title" />
        <ToastDescription class="demo-toast-description" />
      </div>
      <ToastClose class="demo-toast-close">×</ToastClose>
    </ToastRoot>
  </ToastViewport>

  <DemoOutput>repeatCount: {{ toasts.find((toast) => toast.id === 'offline')?.repeatCount ?? '—' }}</DemoOutput>
</template>
