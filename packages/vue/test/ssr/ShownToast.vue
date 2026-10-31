<script setup lang="ts">
import { createToastStore, ToastViewport, ToastRoot, ToastTitle, ToastDescription, ToastClose } from '../../src';

// A store per render, as a server should keep one per request.
const store = createToastStore();
store.add({ title: 'Saved', text: 'Revision 2 is live.' });
</script>

<template>
  <ToastViewport :store="store">
    <ToastRoot>
      <ToastTitle />
      <ToastDescription />
      <ToastClose>×</ToastClose>
    </ToastRoot>
  </ToastViewport>
</template>
