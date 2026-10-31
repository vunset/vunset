<script setup lang="ts">
import { ScrollArea } from '@vunset/vue';
import './scroll-area.css';

const releases = [
  ['4.2.0', 'Scroll areas publish their distance to each edge.'],
  ['4.1.3', 'Dialogs behind a stack scale by nesting level.'],
  ['4.1.2', 'Menus stay open when the pointer crosses into a submenu.'],
  ['4.1.1', 'Radio groups no longer scroll the page when clicked.'],
  ['4.1.0', 'Checkbox, radio and switch share one toggle engine.'],
  ['4.0.4', 'Arrows wait for placement instead of flashing into position.'],
  ['4.0.3', 'Toasts keep their height while leaving.'],
  ['4.0.2', 'Toast ids deduplicate, with a nudge to say so.']
];
</script>

<template>
  <div class="demo-scroll-frame">
    <ScrollArea axis="y" :overflow-threshold="8" class="demo-scroll-area demo-scroll-area-sticky">
      <div class="demo-scroll-area-header">Releases</div>
      <div v-for="[version, summary] in releases" :key="version" class="demo-scroll-area-item">
        <b>{{ version }}</b>
        <span>{{ summary }}</span>
      </div>
      <div class="demo-scroll-area-more">More below ↓</div>
    </ScrollArea>
  </div>
</template>
