<script setup lang="ts">
import { ref } from 'vue';
import { Button, MeterRoot, MeterLabel, MeterValue } from '@vunset/vue';
import '../button/button.css';
import '../progress/gauge.css';

const battery = ref(64);
</script>

<template>
  <div class="demo-gauge-actions">
    <MeterRoot :value="battery" :format="{ style: 'unit', unit: 'percent' }" class="demo-gauge-ring">
      <MeterLabel class="demo-gauge-hidden">Battery</MeterLabel>
      <MeterValue />
    </MeterRoot>

    <div class="demo-gauge-group">
      <Button class="demo-button" @click="battery = Math.min(100, battery + 12)">Charge</Button>
      <Button class="demo-button" @click="battery = Math.max(0, battery - 12)">Drain</Button>
    </div>
  </div>
</template>
