<script setup lang="ts">
import { ref } from 'vue';
import { ToggleGroup, Toggle } from '@vunset/vue';
import './toggle.css';

const overlays = ref<string[]>(['grid']);
</script>

<template>
  <ToggleGroup v-model="overlays" multiple orientation="vertical" aria-label="Canvas" class="demo-toggle-group">
    <Toggle value="grid" class="demo-toggle">Grid</Toggle>
    <Toggle value="rulers" class="demo-toggle">Rulers</Toggle>
    <Toggle value="guides" class="demo-toggle">Guides</Toggle>
  </ToggleGroup>

  <DemoOutput>v-model: {{ overlays }}</DemoOutput>
</template>
