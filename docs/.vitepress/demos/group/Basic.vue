<script setup lang="ts">
import { Group } from '@vunset/vue';
import './group.css';
</script>

<template>
  <Group label="Message actions" class="demo-group">
    <button type="button" class="demo-group-button">Reply</button>
    <button type="button" class="demo-group-button">Forward</button>
    <button type="button" class="demo-group-button">Archive</button>
  </Group>
</template>
