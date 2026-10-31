<script setup lang="ts">
import { ref } from 'vue';
import {
  Button,
  createToastStore,
  useToast,
  ToastViewport,
  ToastRoot,
  ToastTitle,
  ToastAction,
  ToastClose
} from '@vunset/vue';
import '../button/button.css';
import './toast.css';

const store = createToastStore();
const { setToast } = useToast(store);

const inbox = ref(['Quarterly report', 'Team offsite', 'Invoice #1042']);

function archive() {
  const [subject] = inbox.value;
  if (!subject) return;

  inbox.value = inbox.value.slice(1);
  setToast({
    title: `“${subject}” archived`,
    data: { undo: () => (inbox.value = [subject, ...inbox.value]) }
  });
}
</script>

<template>
  <Button class="demo-button" :disabled="!inbox.length" @click="archive">Archive “{{ inbox[0] ?? '…' }}”</Button>

  <ToastViewport :store="store" class="demo-toast-viewport">
    <ToastRoot v-slot="{ toast }" class="demo-toast">
      <ToastTitle class="demo-toast-title" />
      <div class="demo-toast-actions">
        <ToastAction class="demo-toast-action" @click="toast.data.undo()">Undo</ToastAction>
        <ToastClose class="demo-toast-close">×</ToastClose>
      </div>
    </ToastRoot>
  </ToastViewport>

  <DemoOutput>inbox: {{ inbox.join(', ') || 'empty' }}</DemoOutput>
</template>
