<script setup lang="ts">
import { ScrollArea } from '@vunset/vue';
import './scroll-area.css';

const tags = ['accessibility', 'animation', 'combobox', 'dialog', 'dismissal', 'field', 'focus-trap', 'menu', 'portal', 'positioning', 'range', 'select', 'toast', 'tooltip'];
</script>

<template>
  <div class="demo-scroll-frame">
    <ScrollArea axis="x" fade="x" :fade-size="24" class="demo-scroll-area demo-scroll-area-row">
      <span v-for="tag in tags" :key="tag" class="demo-scroll-area-tag">{{ tag }}</span>
    </ScrollArea>
  </div>
</template>
