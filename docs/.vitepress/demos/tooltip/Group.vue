<script setup lang="ts">
import { TooltipGroup, TooltipRoot, TooltipTrigger, Portal, Positioner, Popup } from '@vunset/vue';
import './tooltip.css';

const tools = [
  { label: 'Bold', key: 'B', mark: 'b' },
  { label: 'Italic', key: 'I', mark: 'i' },
  { label: 'Underline', key: 'U', mark: 'u' }
];
</script>

<template>
  <TooltipGroup :delay="400">
    <div class="demo-tooltip-group-row">
      <TooltipRoot v-for="tool in tools" :key="tool.label">
        <TooltipTrigger :aria-label="tool.label" class="demo-tooltip-trigger">
          <component :is="tool.mark">{{ tool.key }}</component>
        </TooltipTrigger>

        <Portal>
          <Positioner>
            <Popup class="demo-tooltip">{{ tool.label }} · ⌘{{ tool.key }}</Popup>
          </Positioner>
        </Portal>
      </TooltipRoot>
    </div>
  </TooltipGroup>
</template>
