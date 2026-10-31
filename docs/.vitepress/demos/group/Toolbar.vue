<script setup lang="ts">
import { Group, Separator } from '@vunset/vue';
import './group.css';
</script>

<template>
  <Group variant="toolbar" label="Formatting" class="demo-group">
    <button type="button" aria-label="Bold" class="demo-group-button"><b>B</b></button>
    <button type="button" aria-label="Italic" class="demo-group-button"><i>I</i></button>

    <Separator class="demo-group-separator" />

    <button type="button" class="demo-group-button">Link</button>
  </Group>
</template>
