<script setup lang="ts">
import { ref } from 'vue';
import { DragRoot, DragItem } from '@vunset/vue';
import './drag.css';

const tiles = ref(['Inbox', 'Calendar', 'Files', 'Notes', 'Photos', 'Music', 'Maps', 'Settings']);
</script>

<template>
  <DragRoot v-model="tiles" orientation="grid" class="demo-drag">
    <DragItem v-for="tile in tiles" :key="tile" :value="tile" class="demo-drag-item demo-drag-tile">{{ tile }}</DragItem>
  </DragRoot>

  <DemoOutput>{{ tiles.join(', ') }}</DemoOutput>
</template>
