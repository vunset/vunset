<script setup lang="ts">
import { ref } from 'vue';
import {
  Button,
  createToastStore,
  useToast,
  ToastViewport,
  ToastRoot,
  ToastTitle,
  ToastClose,
  type ToastPosition
} from '@vunset/vue';
import '../button/button.css';
import './toast.css';

const store = createToastStore();
const { setToast, clearToasts } = useToast(store);

const positions: ToastPosition[] = ['top-start', 'top-center', 'top-end', 'bottom-start', 'bottom-center', 'bottom-end'];
const position = ref<ToastPosition>('bottom-end');

function show(next: ToastPosition) {
  if (next !== position.value) clearToasts();
  position.value = next;
  setToast({ title: `From the ${next.replace('-', ' ')}` });
}
</script>

<template>
  <div class="demo-toast-positions">
    <Button v-for="option in positions" :key="option" class="demo-button" @click="show(option)">{{ option }}</Button>
  </div>

  <ToastViewport :store="store" :position="position" class="demo-toast-viewport">
    <ToastRoot class="demo-toast">
      <ToastTitle class="demo-toast-title" />
      <ToastClose class="demo-toast-close">×</ToastClose>
    </ToastRoot>
  </ToastViewport>
</template>
