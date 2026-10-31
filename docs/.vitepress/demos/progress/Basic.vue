<script setup lang="ts">
import { onScopeDispose, ref } from 'vue';
import { Button, ProgressRoot, ProgressLabel, ProgressValue, ProgressTrack, ProgressIndicator } from '@vunset/vue';
import '../button/button.css';
import './gauge.css';

const uploaded = ref(0);
let timer: ReturnType<typeof setInterval> | undefined;

function start() {
  clearInterval(timer);
  uploaded.value = 0;
  timer = setInterval(() => {
    uploaded.value = Math.min(100, uploaded.value + 7);
    if (uploaded.value === 100) clearInterval(timer);
  }, 240);
}

onScopeDispose(() => clearInterval(timer));
</script>

<template>
  <div class="demo-gauge-group">
    <ProgressRoot v-slot="{ status }" :value="uploaded" :format="{ style: 'unit', unit: 'percent' }" class="demo-gauge">
      <div class="demo-gauge-head">
        <ProgressLabel>Uploading footage.mov</ProgressLabel>
        <ProgressValue class="demo-gauge-value" />
      </div>

      <ProgressTrack class="demo-gauge-track">
        <ProgressIndicator class="demo-gauge-indicator" />
      </ProgressTrack>

      <DemoOutput>status: {{ status }}</DemoOutput>
    </ProgressRoot>

    <Button class="demo-button" @click="start">Start upload</Button>
  </div>
</template>
