<script setup lang="ts">
import {
  PopoverRoot,
  PopoverTrigger,
  Portal,
  Positioner,
  Popup,
  PopoverTitle,
  PopoverDescription,
  PopoverClose
} from '@vunset/vue';
import './popover.css';
</script>

<template>
  <PopoverRoot modal>
    <PopoverTrigger class="demo-popover-trigger">Delete…</PopoverTrigger>

    <Portal>
      <Positioner>
        <Popup class="demo-popover">
          <PopoverTitle class="demo-popover-title">Delete this file?</PopoverTitle>
          <PopoverDescription class="demo-popover-description">
            The page behind can't be scrolled or reached until you choose.
          </PopoverDescription>
          <PopoverClose aria-label="Close" class="demo-popover-close">×</PopoverClose>
        </Popup>
      </Positioner>
    </Portal>
  </PopoverRoot>
</template>
