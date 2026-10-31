<script setup lang="ts">
import { ref } from 'vue';
import { DragRoot, DragItem, DragHandle } from '@vunset/vue';
import './drag.css';

const columns = ref([
  { id: 'name', label: 'Name', shown: true },
  { id: 'email', label: 'Email', shown: true },
  { id: 'role', label: 'Role', shown: false },
  { id: 'created', label: 'Created', shown: true }
]);
</script>

<template>
  <DragRoot v-slot="{ items }" v-model="columns" handle class="demo-drag">
    <DragItem v-for="column in items" :key="column.id" :value="column" class="demo-drag-item">
      <DragHandle class="demo-drag-handle">⠿</DragHandle>
      <label>{{ column.label }}</label>
    </DragItem>
  </DragRoot>

  <DemoOutput>v-model: {{ columns.map((column) => column.id).join(', ') }}</DemoOutput>
</template>
