<script setup lang="ts">
import { MeterRoot, MeterLabel, MeterValue, MeterTrack, MeterIndicator } from '@vunset/vue';
import '../progress/gauge.css';
</script>

<template>
  <MeterRoot :value="41" :format="{ style: 'unit', unit: 'percent' }" class="demo-gauge">
    <div class="demo-gauge-head">
      <MeterLabel>Disk used</MeterLabel>
      <MeterValue class="demo-gauge-value" />
    </div>
    <MeterTrack class="demo-gauge-track">
      <MeterIndicator class="demo-gauge-indicator" />
    </MeterTrack>
  </MeterRoot>
</template>
