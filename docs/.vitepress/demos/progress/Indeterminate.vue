<script setup lang="ts">
import { ProgressRoot, ProgressLabel, ProgressTrack, ProgressIndicator } from '@vunset/vue';
import './gauge.css';
</script>

<template>
  <ProgressRoot :value="null" class="demo-gauge">
    <ProgressLabel>Preparing the export</ProgressLabel>
    <ProgressTrack class="demo-gauge-track">
      <ProgressIndicator class="demo-gauge-indicator" />
    </ProgressTrack>
  </ProgressRoot>
</template>
