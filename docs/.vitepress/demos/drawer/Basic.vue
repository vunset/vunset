<script setup lang="ts">
import {
  DrawerRoot,
  DrawerTrigger,
  Portal,
  DrawerBackdrop,
  Popup,
  DrawerHandle,
  DrawerTitle,
  DrawerDescription,
  DrawerClose
} from '@vunset/vue';
import '../button/button.css';
import './drawer.css';
</script>

<template>
  <DrawerRoot>
    <DrawerTrigger class="demo-button">Share</DrawerTrigger>

    <Portal>
      <DrawerBackdrop class="demo-drawer-backdrop" />
      <Popup class="demo-drawer">
        <DrawerHandle class="demo-drawer-handle" />
        <DrawerTitle class="demo-drawer-title">Share this page</DrawerTitle>
        <DrawerDescription class="demo-drawer-description">
          Drag the handle down, or press outside, to dismiss.
        </DrawerDescription>
        <DrawerClose class="demo-button">Copy link</DrawerClose>
      </Popup>
    </Portal>
  </DrawerRoot>
</template>
