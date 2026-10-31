<script setup lang="ts">
import { ref } from 'vue';
import { Icon, Toggle } from '@vunset/vue';
import '../toggle-group/toggle.css';
import './icon.css';

// The same Icon flips between a sprite reference and a file's own markup.
const inline = ref(false);
</script>

<template>
  <Toggle v-model="inline" class="demo-toggle">
    <Icon :name="inline ? 'star' : 'check'" :inline class="demo-icon-sm" />
    Switch
  </Toggle>

  <DemoOutput>{{ inline ? 'star (file)' : 'check (sprite)' }}</DemoOutput>
</template>
