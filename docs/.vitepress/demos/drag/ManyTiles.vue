<script setup lang="ts">
import { ref } from 'vue';
import { DragRoot, DragItem } from '@vunset/vue';
import './drag.css';

const tiles = ref(Array.from({ length: 40 }, (_, index) => index + 1));
</script>

<template>
  <DragRoot v-model="tiles" orientation="grid" class="demo-drag demo-drag-dense">
    <DragItem v-for="tile in tiles" :key="tile" :value="tile" class="demo-drag-item demo-drag-tile">{{ tile }}</DragItem>
  </DragRoot>
</template>
