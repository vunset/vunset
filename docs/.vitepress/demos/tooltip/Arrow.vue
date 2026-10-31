<script setup lang="ts">
import { TooltipRoot, TooltipTrigger, Portal, Positioner, Popup, TooltipArrow, type Side } from '@vunset/vue';
import './tooltip.css';

const sides: Side[] = ['top', 'right', 'bottom', 'left'];
</script>

<template>
  <div class="demo-tooltip-group-row">
    <TooltipRoot v-for="side in sides" :key="side" :side="side" :side-offset="8">
      <TooltipTrigger class="demo-tooltip-trigger">{{ side }}</TooltipTrigger>

      <Portal>
        <Positioner>
          <Popup class="demo-tooltip">
            <TooltipArrow class="demo-tooltip-arrow" />
            On the {{ side }}
          </Popup>
        </Positioner>
      </Portal>
    </TooltipRoot>
  </div>
</template>
