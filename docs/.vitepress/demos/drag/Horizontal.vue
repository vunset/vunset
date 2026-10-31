<script setup lang="ts">
import { ref } from 'vue';
import { DragRoot, DragItem } from '@vunset/vue';
import './drag.css';

const tags = ref(['vue', 'headless', 'a11y', 'charts', 'dates']);
</script>

<template>
  <DragRoot v-model="tags" orientation="horizontal" class="demo-drag">
    <DragItem v-for="tag in tags" :key="tag" :value="tag" class="demo-drag-item">{{ tag }}</DragItem>
  </DragRoot>
</template>
