<script setup lang="ts">
import {
  DrawerRoot,
  DrawerTrigger,
  DrawerBackdrop,
  DrawerHandle,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
  Portal,
  Popup
} from '../../src';
</script>

<template>
  <DrawerRoot default-open>
    <DrawerTrigger>Open</DrawerTrigger>
    <Portal>
      <DrawerBackdrop />
      <Popup>
        <DrawerHandle />
        <DrawerTitle>Title</DrawerTitle>
        <DrawerDescription>Text</DrawerDescription>
        <DrawerClose>Close</DrawerClose>
      </Popup>
    </Portal>
  </DrawerRoot>
</template>
