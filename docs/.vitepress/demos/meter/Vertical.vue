<script setup lang="ts">
import { MeterRoot, MeterLabel, MeterValue, MeterTrack, MeterIndicator } from '@vunset/vue';
import '../progress/gauge.css';

const usage = [
  { name: 'CPU', value: 72 },
  { name: 'Memory', value: 48 },
  { name: 'Disk', value: 91 }
];
</script>

<template>
  <div class="demo-gauge-actions">
    <MeterRoot
      v-for="item in usage"
      :key="item.name"
      :value="item.value"
      :format="{ style: 'unit', unit: 'percent' }"
      class="demo-gauge-vertical"
    >
      <MeterValue class="demo-gauge-value" />
      <MeterTrack class="demo-gauge-track">
        <MeterIndicator class="demo-gauge-indicator" />
      </MeterTrack>
      <MeterLabel>{{ item.name }}</MeterLabel>
    </MeterRoot>
  </div>
</template>
