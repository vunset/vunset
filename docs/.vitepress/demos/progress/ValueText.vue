<script setup lang="ts">
import { ref } from 'vue';
import { Button, ProgressRoot, ProgressLabel, ProgressValue, ProgressTrack, ProgressIndicator } from '@vunset/vue';
import '../button/button.css';
import './gauge.css';

const step = ref(3);
</script>

<template>
  <div class="demo-gauge-group">
    <ProgressRoot
      :value="step"
      :min="0"
      :max="7"
      :get-value-text="(formatted) => `Step ${formatted} of 7`"
      class="demo-gauge"
    >
      <div class="demo-gauge-head">
        <ProgressLabel>Setting up your workspace</ProgressLabel>
        <ProgressValue v-slot="{ value, max }" class="demo-gauge-value">{{ value }} / {{ max }}</ProgressValue>
      </div>

      <ProgressTrack class="demo-gauge-track">
        <ProgressIndicator class="demo-gauge-indicator" />
      </ProgressTrack>
    </ProgressRoot>

    <div class="demo-gauge-actions">
      <Button class="demo-button" :disabled="step === 0" @click="step--">Back</Button>
      <Button class="demo-button" :disabled="step === 7" @click="step++">Next</Button>
    </div>
  </div>
</template>
