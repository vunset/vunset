<script setup lang="ts">
import { ref } from 'vue';
import {
  DialogRoot,
  DialogTrigger,
  Portal,
  DialogBackdrop,
  Popup,
  DialogTitle,
  DialogDescription,
  DialogClose
} from '@vunset/vue';
import '../button/button.css';
import './dialog.css';

const deleted = ref(false);
</script>

<template>
  <DialogRoot role="alertdialog">
    <DialogTrigger class="demo-button">Delete project</DialogTrigger>

    <Portal>
      <DialogBackdrop class="demo-dialog-backdrop" />
      <Popup class="demo-dialog">
        <DialogTitle class="demo-dialog-title">Delete this project?</DialogTitle>
        <DialogDescription class="demo-dialog-description">
          Its pages and files go with it. This can't be undone.
        </DialogDescription>

        <div class="demo-dialog-actions">
          <DialogClose class="demo-button" autofocus>Cancel</DialogClose>
          <DialogClose class="demo-button" @click="deleted = true">Delete</DialogClose>
        </div>
      </Popup>
    </Portal>
  </DialogRoot>

  <DemoOutput>deleted: {{ deleted }}</DemoOutput>
</template>
