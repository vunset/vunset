<script setup lang="ts">
import { Group, Separator } from '@vunset/vue';
import './group.css';
</script>

<template>
  <Group orientation="vertical" label="Zoom" class="demo-group">
    <button type="button" aria-label="Zoom in" class="demo-group-button">+</button>
    <Separator class="demo-group-separator" />
    <button type="button" aria-label="Zoom out" class="demo-group-button">−</button>
  </Group>
</template>
