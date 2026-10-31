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
  type Align
} from '@vunset/vue';
import './popover.css';

const aligns: Align[] = ['start', 'center', 'end'];
</script>

<template>
  <div class="demo-popover-row">
    <PopoverRoot v-for="align in aligns" :key="align" side="top" :align="align">
      <PopoverTrigger class="demo-popover-trigger">{{ align }}</PopoverTrigger>

      <Portal>
        <Positioner>
          <Popup class="demo-popover">
            <PopoverArrow class="demo-popover-arrow" />
            <PopoverTitle class="demo-popover-title">Above, at the {{ align }}</PopoverTitle>
            <PopoverDescription class="demo-popover-description">
              Flips below the trigger when there's no room above.
            </PopoverDescription>
          </Popup>
        </Positioner>
      </Portal>
    </PopoverRoot>
  </div>
</template>
