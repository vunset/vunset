<script setup lang="ts">
import { TooltipRoot, TooltipTrigger, Portal, Positioner, Popup } from '@vunset/vue';
import './tooltip.css';
</script>

<template>
  <TooltipRoot>
    <TooltipTrigger aria-label="Bold" class="demo-tooltip-trigger"><b>B</b></TooltipTrigger>

    <Portal>
      <Positioner>
        <Popup class="demo-tooltip">Bold · ⌘B</Popup>
      </Positioner>
    </Portal>
  </TooltipRoot>
</template>
