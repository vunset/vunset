<script setup lang="ts">
import { TooltipRoot, TooltipTrigger, Portal, Positioner, Popup } from '@vunset/vue';
import './tooltip.css';
</script>

<template>
  <TooltipRoot side="right">
    <TooltipTrigger class="demo-tooltip-trigger">Shortcuts</TooltipTrigger>

    <Portal>
      <Positioner>
        <Popup class="demo-tooltip">Press ? anywhere</Popup>
      </Positioner>
    </Portal>
  </TooltipRoot>
</template>
