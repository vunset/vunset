<script setup lang="ts">
import {
  DrawerRoot,
  DrawerTrigger,
  Portal,
  DrawerBackdrop,
  Popup,
  DrawerTitle,
  DrawerDescription,
  DrawerClose
} from '@vunset/vue';
import '../button/button.css';
import './drawer.css';
</script>

<template>
  <DrawerRoot swipeable>
    <DrawerTrigger class="demo-button">Details</DrawerTrigger>

    <Portal>
      <DrawerBackdrop class="demo-drawer-backdrop" />
      <Popup class="demo-drawer">
        <DrawerTitle class="demo-drawer-title">Order #1042</DrawerTitle>
        <DrawerDescription class="demo-drawer-description">
          Drag anywhere on the sheet to dismiss it. The button still takes a tap.
        </DrawerDescription>
        <DrawerClose class="demo-button">Track parcel</DrawerClose>
      </Popup>
    </Portal>
  </DrawerRoot>
</template>
