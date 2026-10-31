<script setup lang="ts">
import { TooltipRoot, TooltipTrigger, Portal, Positioner, Popup } from '@vunset/vue';
import './tooltip.css';
</script>

<template>
  <div class="demo-tooltip-group-row">
    <TooltipRoot :close-delay="200">
      <TooltipTrigger class="demo-tooltip-trigger">License</TooltipTrigger>

      <Portal>
        <Positioner>
          <Popup class="demo-tooltip">Released under MIT. Try selecting this.</Popup>
        </Positioner>
      </Portal>
    </TooltipRoot>

    <TooltipRoot :hoverable="false">
      <TooltipTrigger class="demo-tooltip-trigger">Not hoverable</TooltipTrigger>

      <Portal>
        <Positioner>
          <Popup class="demo-tooltip">Gone once the pointer leaves the trigger</Popup>
        </Positioner>
      </Portal>
    </TooltipRoot>
  </div>
</template>
