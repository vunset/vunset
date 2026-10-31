<script setup lang="ts">
import { Button, useToast, ToastViewport, ToastRoot, ToastTitle, ToastDescription, ToastClose } from '@vunset/vue';
import '../button/button.css';
import './toast.css';

const { setToast } = useToast();

let revision = 0;

function save() {
  revision += 1;
  setToast({ title: 'Changes saved', text: `Revision ${revision} is live.` });
}
</script>

<template>
  <Button class="demo-button" @click="save">Save</Button>

  <ToastViewport class="demo-toast-viewport">
    <ToastRoot class="demo-toast">
      <div>
        <ToastTitle class="demo-toast-title" />
        <ToastDescription class="demo-toast-description" />
      </div>
      <ToastClose class="demo-toast-close">×</ToastClose>
    </ToastRoot>
  </ToastViewport>
</template>
