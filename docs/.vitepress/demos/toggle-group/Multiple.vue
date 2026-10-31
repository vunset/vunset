<script setup lang="ts">
import { ref } from 'vue';
import { ToggleGroup, Toggle } from '@vunset/vue';
import './toggle.css';

const marks = ref<string[]>(['bold']);
</script>

<template>
  <ToggleGroup v-model="marks" multiple aria-label="Formatting" class="demo-toggle-group">
    <Toggle value="bold" aria-label="Bold" class="demo-toggle"><b>B</b></Toggle>
    <Toggle value="italic" aria-label="Italic" class="demo-toggle"><i>I</i></Toggle>
    <Toggle value="underline" aria-label="Underline" class="demo-toggle"><u>U</u></Toggle>
  </ToggleGroup>

  <DemoOutput>v-model: {{ marks }}</DemoOutput>
</template>
