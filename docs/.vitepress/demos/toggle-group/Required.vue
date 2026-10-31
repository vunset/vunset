<script setup lang="ts">
import { ref } from 'vue';
import { ToggleGroup, Toggle } from '@vunset/vue';
import './toggle.css';

const view = ref<string | null>('list');
</script>

<template>
  <ToggleGroup v-model="view" required aria-label="View" class="demo-toggle-group">
    <Toggle value="list" class="demo-toggle">List</Toggle>
    <Toggle value="grid" class="demo-toggle">Grid</Toggle>
    <Toggle value="board" class="demo-toggle">Board</Toggle>
  </ToggleGroup>
</template>
