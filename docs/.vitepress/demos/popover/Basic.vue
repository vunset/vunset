<script setup lang="ts">
import {
  PopoverRoot,
  PopoverTrigger,
  Portal,
  Positioner,
  Popup,
  PopoverArrow,
  PopoverTitle,
  PopoverDescription,
  PopoverClose
} from '@vunset/vue';
import './popover.css';
</script>

<template>
  <PopoverRoot>
    <PopoverTrigger class="demo-popover-trigger">Notifications</PopoverTrigger>

    <Portal>
      <Positioner>
        <Popup class="demo-popover">
          <PopoverArrow class="demo-popover-arrow" />
          <PopoverTitle class="demo-popover-title">Notifications</PopoverTitle>
          <PopoverDescription class="demo-popover-description">You are all caught up.</PopoverDescription>
          <PopoverClose aria-label="Close" class="demo-popover-close">×</PopoverClose>
        </Popup>
      </Positioner>
    </Portal>
  </PopoverRoot>
</template>
