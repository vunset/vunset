<script setup lang="ts">
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
</script>

<template>
  <DialogRoot>
    <DialogTrigger class="demo-button">Edit profile</DialogTrigger>

    <Portal>
      <DialogBackdrop class="demo-dialog-backdrop" />
      <Popup class="demo-dialog">
        <DialogTitle class="demo-dialog-title">Edit profile</DialogTitle>
        <DialogDescription class="demo-dialog-description">
          Changes are saved to your account and shown on your public page.
        </DialogDescription>

        <div class="demo-dialog-actions">
          <DialogClose class="demo-button">Cancel</DialogClose>
          <DialogClose class="demo-button">Save</DialogClose>
        </div>
      </Popup>
    </Portal>
  </DialogRoot>
</template>
