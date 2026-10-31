<script setup lang="ts">
import { ref } from 'vue';
import { ToggleGroup, Toggle } from '@vunset/vue';
import './toggle.css';

const align = ref<string | null>('left');
</script>

<template>
  <ToggleGroup v-model="align" aria-label="Text alignment" class="demo-toggle-group">
    <Toggle value="left" class="demo-toggle">Left</Toggle>
    <Toggle value="center" class="demo-toggle">Center</Toggle>
    <Toggle value="right" class="demo-toggle">Right</Toggle>
    <Toggle value="justify" disabled class="demo-toggle">Justify</Toggle>
  </ToggleGroup>

  <DemoOutput>v-model: {{ align ?? 'null' }}</DemoOutput>
</template>
