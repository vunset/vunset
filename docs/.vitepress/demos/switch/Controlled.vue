<script setup lang="ts">
import { ref } from 'vue';
import { SwitchRoot, SwitchThumb } from '@vunset/vue';
import './switch.css';

const darkMode = ref(true);
</script>

<template>
  <label class="demo-switch-label">
    <SwitchRoot v-model="darkMode" class="demo-switch">
      <SwitchThumb class="demo-switch-thumb" />
    </SwitchRoot>
    Dark mode
  </label>

  <DemoOutput>v-model: {{ darkMode }}</DemoOutput>
</template>
