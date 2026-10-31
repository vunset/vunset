<script setup lang="ts">
import { ref } from 'vue';
import { SwitchRoot, SwitchThumb } from '@vunset/vue';
import './switch.css';

const theme = ref<'light' | 'dark'>('light');
</script>

<template>
  <label class="demo-switch-label">
    <SwitchRoot v-model="theme" true-value="dark" false-value="light" class="demo-switch">
      <SwitchThumb class="demo-switch-thumb" />
    </SwitchRoot>
    Dark theme
  </label>

  <DemoOutput>v-model: {{ theme }}</DemoOutput>
</template>
