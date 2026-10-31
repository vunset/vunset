<script setup lang="ts">
import { TooltipGroup, TooltipRoot, TooltipTrigger, TooltipArrow, Portal, Positioner, Popup } from '../../src';
</script>

<template>
  <TooltipGroup>
    <TooltipRoot default-open>
      <TooltipTrigger>Hover</TooltipTrigger>
      <Portal>
        <Positioner>
          <Popup>
            <TooltipArrow />
            Tip
          </Popup>
        </Positioner>
      </Portal>
    </TooltipRoot>
  </TooltipGroup>
</template>
