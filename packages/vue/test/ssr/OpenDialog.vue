<script setup lang="ts">
import {
  DialogRoot,
  DialogTrigger,
  DialogBackdrop,
  DialogTitle,
  DialogDescription,
  DialogClose,
  Portal,
  Popup
} from '../../src';
</script>

<template>
  <DialogRoot default-open>
    <DialogTrigger>Open</DialogTrigger>
    <Portal>
      <DialogBackdrop />
      <Popup>
        <DialogTitle>Title</DialogTitle>
        <DialogDescription>Text</DialogDescription>
        <input />
        <DialogClose>Close</DialogClose>
      </Popup>
    </Portal>
  </DialogRoot>
</template>
