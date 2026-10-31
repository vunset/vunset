<script setup lang="ts">
import { ref } from 'vue';
import { DragRoot, DragItem, type DragChange } from '@vunset/vue';
import './drag.css';

const tasks = ref(['Write the spec', 'Review the design', 'Build the parts', 'Test on a phone', 'Ship it']);

const moved = ref('—');

function onChange({ value, from, to }: DragChange<string>) {
  moved.value = `${value}: ${from} → ${to}`;
}
</script>

<template>
  <DragRoot v-model="tasks" class="demo-drag" @change="onChange">
    <DragItem v-for="task in tasks" :key="task" :value="task" class="demo-drag-item">{{ task }}</DragItem>
  </DragRoot>

  <DemoOutput>@change: {{ moved }}</DemoOutput>
</template>
